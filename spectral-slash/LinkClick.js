var originalLogFcn = console.log

console.log = 
    function(input) {
        if (input.indexOf("clickLink:") != -1) {
            let steamLink = input.substring(input.indexOf(":")+1);
            window.open(steamLink);
        } else {
            originalLogFcn(input)
        }
    }