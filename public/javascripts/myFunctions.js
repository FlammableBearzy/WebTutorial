function ChangeColor()
{
    //alert("pepo");
    const randomColor = Math.floor(Math.random()*16777215).toString(16);
    const BackgroundColor = Math.floor(Math.random()*16777215).toString(16);
    
    document.getElementById("ColorID").style.color = "#" + randomColor;
    document.getElementById("backColor").style.backgroundColor = "#" + BackgroundColor;
    
    console.log("This is being called");
}