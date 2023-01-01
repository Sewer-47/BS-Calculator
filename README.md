# BS-Calculator - Simple calculator lib
<br>

All you need to use this library is include Calculator.js script and themes.json file and add the ```<calculator>``` tag in your page


```
<div class="col">
  <bs-calculator title="Light example" theme="light" type="simple"></bs-calculator>
</div>

<div class="col">
  <bs-calculator title="Dark example" theme="dark" type="simple"></bs-calculator>
 </div>	
```


The library was made to work with bootstrap.
However, thanks to the fact that the library is fully configurable (themes.json) you can use it with raw html code :)



<h1>Configuration of the main element of calculator:</h1>

```
    {
      "type" : "dark",
      "container" : ["border", "border-secondary", "rounded", "mt-5", "bg-dark"],
      "title" : ["text-light"],
      "input" : ["bg-secondary", "border-dark", "mt-3", "mb-3", "text-light"],
      "button" : ["btn", "bg-secondary", "text-light", "w-100"],
      "buttonAnimation" : ["btn", "bg-light", "text-dark", "w-100"]
    }
```

<h1>Button configuration:</h1>

```
    {
      "fun" : "clearInput();",                                <-- function invoked by click
      "style" : {                                             <-- overriden css classes
        "light" : ["btn", "bg-light", "text-danger", "w-100"],
        "dark" : ["btn", "bg-secondary", "text-danger", "w-100"]
      },
      "animation" : {},                                       <-- default css classes taken from main element config
      "key" : "Escape", 
      "displayName" : "AC"
    },

    {
      "fun" : "backspace();",                             <-- function invoked by click
      "style" : {},                                       <-- default css classes taken from main element config
      "animation" : {},                                   <-- default css classes taken from main element config
      "key" : "Backspace",
      "displayName" : "⌫"
    },
```   

<h1>TODO list:</h1>

<ul>
  <li>rewrite the InputProcessor class</li>
  <li>add more themes</li>
</ul>  

<h1>Example themes:</h1>
<img src="https://i.imgur.com/CX6qcWc.png">
<img src="https://i.imgur.com/lwe8KBf.png">


