import { XpathAST } from "./tree/Xpath.ast";
import { StaticExpression } from "./performer/Expression/StaticExpression";
import { RootAxis } from "./performer/Axis/RootNode";

import "./performer/Function";
import "./performer/Axis";
import "./performer/Operator";
import "./performer/Filter";
import "./performer/Combiner";
import { PerformerStore } from "./PerformerStore";


const TOKENIZER = Symbol();
const TREE = Symbol();
let tokensArray1 = [];

export class Compiler {

    constructor(tokenizer) {
        this[TOKENIZER] = tokenizer;
        tokensArray1 = tokenizer;
        this[TREE] = new XpathAST();
    }

    compile() {
        this[TREE].apply(new RootAxis());
        // let treeArray = [];
        // const tokens = getTokens.call(this);
        // let tokensArray = [];
        // let orIndex = [];
        // console.log(tokens);
        // for (let i =0;i<tokens.length;i++) {
        //     if(tokens[i].value === "or"){
        //         console.log(tokens[i]);
        //         orIndex.push(i);
        //     }
        // }
        // console.log(orIndex);
        // tokensArray.push(tokens.slice(0,orIndex[0]));
        // tokensArray.push(tokens.slice(orIndex[0]+1,tokens.length));
        // console.log(tokensArray)
        //tokensArray.forEach(tokenArray=>{
            tokensArray1.forEach(token => {
                const confBuilder = PerformerStore.get(token);
                if (confBuilder) {
                    this[TREE].apply(confBuilder());
                    return;
                }
                switch(token.type) {
                    case "filter": {
                        switch(token.value) {
                            case "filter-close": {
                                this[TREE].upUntilFilter();
                                break;
                            }
                        }
                        break;
                    }
                    case "integer": {
                        this[TREE].apply(new StaticExpression(token));
                        break;
                    }
                    case "group": {
                        switch (token.value) {
                            case "close": {
                                this[TREE].upUntilGroup();
                                break;
                            }
                        }
                        break;
                    }
                    case "string": {
                        this[TREE].apply(new StaticExpression(token));
                        break;
                    }
                    case "operator": {
                        switch (token.value) {
                            case "comma": {
                                this[TREE].up();
                                break;
                            }
                        }
                        break;
                    }
                }
            });
            //treeArray.push(this[TREE]);
        //});
        return this[TREE];
    }

    process(node) {
        return this[TREE].process(node);
    }

}

function getTokens() {
    const tokens = [];
    while(this[TOKENIZER].hasNext()) {
        tokens.push(this[TOKENIZER].next());
    }
    return tokens;
}