const pool = require("../config/database");


    function cardFromDB(dbObj) {
        return new Card(dbObj.crd_id,
                        dbObj.crd_name, 
                        dbObj.crd_img_url,
                        dbObj.crd_lore,
                        dbObj.crd_description,
                        dbObj.crd_level,
                        dbObj.crd_cost,
                        dbObj.crd_timeout,
                        dbObj.crd_max_usage,
                        dbObj.crd_type);    
    };



    class Card {
        constructor(id, name, url, lore, description, level, cost, timeout, maxUsage, type) {
            this.id = id;
            this.name = name;
            this.url = url;
            this.lore = lore;
            this.description = description;
            this.level = level;
            this.cost = cost;
            this.timeout = timeout;
            this.maxUsage = maxUsage;
            this.type = type;
        }
          
        static async getAll() {
            try {
                let result = [];
                let dbres = await pool.query("Select * from cards");
                let dbCards = dbres.rows;
                    for(let dbCard of dbCards ){
                    result.push(cardFromDB(dbCard));
                    }
                return {status: 200, result: result};
                
            } catch (err) {
                    console.log(err);
                    return {status: 500, result: err };
            }
        } 
        
        static async getById(id) {
            try {
                let dbres = await pool.query("Select * from cards where crd_id = $1", [id]);
                let dbCards = dbres.rows;
                //console.log(dbCards[0]);
                //console.log(dbres.rows[0]);
                if (dbCards[0] == undefined)
                {
                    return {status:404, result: {msg: "No card found with that identifier"}};
                }
                let dbCard = dbCards[0];
                let result = cardFromDB(dbCard);
                return {status: 200, result: result};
                }   catch (err) {
                console.log(err);
                return {status: 500, result: err };
            }
        }

        static async save(newCard) {
            try {
                let dbres = await pool.query("Select * from cards where crd_name = $1", [newCard.name]);
                
                console.log(newCard.name);

                let dbCards = dbres.rows;
/*
                console.log("WE ARE ON SAVE:");
                console.log(dbCards);
                console.log(dbres.rows);
                console.log("1:");
                console.log(dbres.rows[0]);
                console.log("2:");

                console.log(dbCards[0]);
*/              
                if (dbCards.length)
                    return {
                        status: 400,
                        result: [{  
                            location: "body",
                            param: "name",
                            msg: "That name already exists"
                        }]
                    };

                    //dbres is used to store the result of the two queries.
                    //(Using the insert query) We are using the "Returning" clause to get the entire row of the newly inserted card, so we can return it as part of the response
                dbres = await pool.query(`Insert into cards (crd_name, crd_img_url, crd_lore, crd_description, crd_level, crd_cost, crd_timeout, crd_max_usage, crd_type)
                            values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *`,
                            [newCard.name, newCard.url, newCard.lore, newCard.description, newCard.level, newCard.cost, newCard.timeout,  newCard.maxUsage, newCard.type]);
                return { status: 200, result: dbres.rows[0] };
            } catch (err) {
                console.log(err);
                return { status: 500, result: err };
            }
        }
    
        static async filterByType(typeId){
            try {
                let result = [];
                let dbres = await pool.query("Select * from cards where crd_type = $1", [typeId])
                let dbCards = dbres.rows;

                for (let dbCard of dbCards){
                    result.push(cardFromDB(dbCard))
                }
            return { status: 200, result: result };
            } catch (err) {
                console.log(err);
                return { status: 500, result: err };
            }
        }

        static async filterByLoreOrDescription(text) {
            try {
                let result = [];
                let dbres = await pool.query(`Select * from cards where crd_description ILIKE $1 or crd_lore ILIKE $2`, ['%'+text+'%', '%'+text+'%']);
                let dbCards = dbres.rows;
                for (let dbCard of dbCards) {
                    result.push(cardFromDB(dbCard));
                }
                return { status: 200, result: result };
            } catch (err) {
                console.log(err);
                return { status: 500, result: err };
            }
        }

        static async edit(newInfo) {
            try {
                // Checking if card exist to edit the card
                let dbres = await pool.query("Select * from cards where crd_id = $1", [newInfo.id]);
                let dbCards = dbres.rows;
                if (dbCards.length == 0) {
                    return {
                        status: 404, result: {
                            msg: "No card found with that ID"
                        }
                    };
                };
    
                // Checking if the new name does not exist (excludes the card
                // we are editing since we might not want to change the name )
                dbres = await pool.query("Select * from cards where crd_name = $1 and crd_id != $2", [newInfo.name, newInfo.id]);
                dbCards = dbres.rows;
                
                if (dbCards.length)
                    return {
                        status: 400, result: [{
                            location: "body", param: "name",
                            msg: "Another card already has that name"
                        }]
                    };
                
                    // We are considering all values will be changing
                let result = await pool.query(`update cards set crd_name = $1, crd_img_url = $2, crd_lore = $3, crd_description = $4, crd_level = $5, crd_cost = $6, crd_timeout = $7, crd_max_usage = $8, crd_type = $9 where crd_id = $10`,
                    [   newInfo.name,           //1
                        newInfo.url,            //2
                        newInfo.lore,           //3
                        newInfo.description,    //4
                        newInfo.level,          //5
                        newInfo.cost,           //6
                        newInfo.timeout,        //7
                        newInfo.maxUsage,       //8
                        newInfo.type,           //9
                        newInfo.id]);           //10
                return { status: 200, result:{msg:"Card edited" }}
            } catch (err) {
                console.log(err);
                return { status: 500, result: err };
            }
        }

        static async deleteById(id) {
            try {
                let dbres = await pool.query("delete from cards where crd_id = $1", [id]);
                
                // if nothing was deleted it means no card exists with that id
                if (!dbres.rowCount) //This is the counterpart to affectedRows from MYSQL. This is the number of rows that are affected. (Also we can't use dbres.rows.rowCount)
                {
                    return { status: 404, result: { msg: "No card found with that identifier" } };
                }
                return { status: 200, result: {msg: "Card deleted!"} };
            } catch (err) {
                console.log(err);
                return { status: 500, result: err };
            }
        }

    };

    
/*
      try {
                      let result = [];
                      let dbres = await pool.query("Select * from cards");
                      let dbCards = dbres.rows;
                      for(let dbCard of dbCards ){
                        result.push(cardFromDB(dbCard));
                      }
                      return {status: 200, result: result};
                  } catch (err) {
                      console.log(err);
                      return {status: 500, result: err };
                  }
*/

          
    module.exports = Card;