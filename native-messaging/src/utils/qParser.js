



export function qParser(input = "") {

    let tokens = [];
    let current = "";
    let insideQuotes = false;

    const isNumber = (num)=> {
        return /^\d+$/.test(num);
    }

    const pushString = () => {
        if (current === "") return;

        let type = "IDENTIFIER";
        if (insideQuotes) 
            type = "STRING";
        else if (isNumber(current)) 
            type = "NUMBER";
        else if (current === "In") 
            type = "OP_IN";
        else if (current === "StartsWith") 
            type = "OP_START";

        tokens.push({
            type: type,
            value: current
        })
        current= "";
        
    };

    let ch = "";
    for (let i=0; i < input.length; i++) {
         ch = input[i];
        
        if (ch === '"'){
            if (insideQuotes){
                pushString();
            } 
            insideQuotes = !insideQuotes;
            continue;
        }
        else if (ch === '\t' || ch === '\n' || ch === ' ') {
            if (!insideQuotes) {
                pushString();
                continue;
            }
            current += ch;
            continue;
        }
        else if (ch === ',') {
            if (insideQuotes) {
                throw new Error("Invalid comma inside quotation marks");
            } 
            pushString();
            tokens.push({type: "COMMA", value: ch});
            continue;    
        }
        else if (ch === '(') {
            if (insideQuotes) {
                throw  new Error("Invalid parenthesis");
            } 
            pushString();
            tokens.push({type: "LPAREN", value: ch});
            continue;            
        }
        else if (ch === ')') {
            if (insideQuotes) throw new Error("Invalid closing parenthesis");
            pushString();
            tokens.push({type: "RPAREN", value: ch});
            continue;
        }
        else if (ch === '\\') throw new Error("Backslash is not supported");

        current += ch;
        }
    
    if (insideQuotes ) 
        throw new Error("No closing quotation marks!");
    pushString();

    return tokens;
}

console.log(qParser(`testing In ("test", "hello")`));