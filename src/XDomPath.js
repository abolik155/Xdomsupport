import { XpathTokenizer } from './Tokenizer/XpathTokenizer';
import { Compiler } from './Compiler/Compiler';


const TREE = Symbol();
const TOKENIZER1 = Symbol();
let treeArray = [];
let isOrCondition = false;
let isAndCondition = false;
let isPipeCondition = false;
//let nodeElementArray = [];
/**
 * const xdompath = new XDomPath('.//div')
 * const foundItems = xdompath.perform(document.body);
 */
export class XDomPath {

    constructor(query) {
        const tokenizer = new XpathTokenizer(query);
        this[TOKENIZER1] = tokenizer;
        let tokensArray = [];
        const tokens = getTokens.call(this);
        tokensArray = this.conditinTokenizing(tokens);
        tokensArray.forEach(singleTokens => {
            this[TREE] = new Compiler(singleTokens).compile();
            treeArray.push(this[TREE])
        })
        //this[TREE] = new Compiler(tokensArray[0]).compile();
        //this[TREE] = new Compiler(tokensArray[0]).compile();
    }
    
    conditinTokenizing (tokens) {
        let tokensArray = [];
        let orIndex = [];
        let orinside = [];
        console.log(tokens);
        //orIndexInsideBrackets = checkIfOrIsInBrackets.call(this,tokens);
        //console.log(orIndexInsideBrackets)
        let sandip = tokens.findIndex((e)=>{return e.value==="filter-open" })

        orIndex = this.differentiateOperator(tokens);
        if (orIndex && orIndex.length > 0) {


          if (orIndex[0].position !== "inside brackets") {
            tokensArray.push(tokens.slice(0, orIndex[0].inde));
            if (orIndex[1].position !== "inside brackets") {
                tokensArray.push(tokens.slice(orIndex[0].inde+1, orIndex[1].inde));
            }
          } else if (orIndex[0]) {
            tokensArray.push(tokens.slice(0, orIndex[0].inde));
            tokensArray[0].push({
              type: "filter",
              rule: "]",
              value: "filter-close",
            });
            let temptoken = [];
            temptoken.push(
              tokens.slice(
                0,
                tokens.findIndex((e) => {
                  return e.value === "filter-open";
                }) + 1
              )
            );
            let temptokenend = [];
            if (orIndex.length > 1) {
              temptokenend.push(
                tokens.slice(orIndex[0].inde + 1, orIndex[1].inde)
              );
              if (orIndex[1].position === "inside brackets") {
                temptokenend[0].push({
                    type: "filter",
                    rule: "]",
                    value: "filter-close",
                  });    
              }
            } else {
              temptokenend.push(
                tokens.slice(orIndex[0].inde + 1, tokens.length)
              );
            }
            tokensArray.push(temptoken[0].concat(...temptokenend));
            //tokensArray.push(tokens.slice(tokens.findIndex((e)=>{return e.value==="filter-open" }),-orIndex[0].inde))
          }

          for (let i = 1; i < orIndex.length - 1; i++) {
            if (orIndex[i].position !== "inside brackets") {
              tokensArray.push(
                tokens.slice(orIndex[i].inde + 1, orIndex[i + 1].inde)
              );
              if (orIndex[i + 1].position === "inside brackets") {
                tokensArray[tokensArray.length - 1].push({
                  type: "filter",
                  rule: "]",
                  value: "filter-close",
                });
              }
            } else {
              let closedBracketIndex = [];
              let openBracketIndex = [];
              if (orIndex[i - 1].position !== "inside brackets") {
                closedBracketIndex.push(
                  tokens.slice(
                    orIndex[i - 1].inde + 1,
                    tokens.findIndex((e, index) => {
                      if (
                        e.value === "filter-open" &&
                        index > orIndex[i - 1].inde
                      )
                        return index;
                    })+1
                  )
                );
              } else if (orIndex[i - 1].position === "inside brackets") {
                let orOutsideBracket = -1;
                for (let j = orIndex.length - 1; j >= 0; j--) {
                  if (
                    orIndex[j].position === "outside brackets" &&
                    orIndex[j].inde < orIndex[i].inde
                  ) {
                    orOutsideBracket = orIndex[j].inde;
                    break;
                  }
                }
                if (orOutsideBracket !== -1) {
                  let filteropenIndex = -1;
                  for (let j = tokens.length - 1; j >= 0; j--) {
                    if (
                      tokens[j].value === "filter-open" &&
                      j > orOutsideBracket
                    ) {
                      filteropenIndex = j + 1;
                      break;
                    }
                  }
                  closedBracketIndex.push(
                    tokens.slice(
                      orOutsideBracket + 1,
                      tokens.lastIndexOf((e, index) => {
                        if (
                          e.value === "filter-open" &&
                          index > orOutsideBracket
                        )
                          return index;
                      }) + 1
                    )
                  );
                  tokensArray[tokensArray.length - 1].push({
                    type: "filter",
                    rule: "]",
                    value: "filter-close",
                  });
                } else {
                  closedBracketIndex.push(
                    tokens.slice(
                      0,
                      tokens.findIndex((e, index) => {
                        if (
                          e.value === "filter-open" &&
                          index < orIndex[i].inde
                        )
                          return index;
                      }) + 1
                    )
                  );
                }
              }
              openBracketIndex.push(
                tokens.slice(orIndex[i].inde + 1, orIndex[i + 1].inde)
              );
              tokensArray.push(
                closedBracketIndex[0].concat(...openBracketIndex)
              );
              if (orIndex[i + 1].position === "inside brackets") {
                tokensArray[tokensArray.length - 1].push({
                  type: "filter",
                  rule: "]",
                  value: "filter-close",
                });
              }
            }
          }
          if (orIndex[orIndex.length - 1].position !== "inside brackets") {
            tokensArray.push(
              tokens.slice(orIndex[orIndex.length - 1].inde + 1, tokens.length)
            );
          } else if (
            orIndex[orIndex.length - 1].position === "inside brackets"
          ) {
            let closedBracketIndex = [];
            let openBracketIndex = [];
            let orOutsideBracket = -1;
            for (let j = orIndex.length - 1; j >= 0; j--) {
              if (
                orIndex[j].position === "outside brackets" &&
                orIndex[j].inde < orIndex[orIndex.length - 1].inde
              ) {
                orOutsideBracket = orIndex[j].inde;
                break;
              }
            }
            if (orOutsideBracket !== -1) {
              let filteropenIndex = -1;
              for (let j = tokens.length - 1; j >= 0; j--) {
                if (tokens[j].value === "filter-open" && j > orOutsideBracket) {
                  filteropenIndex = j + 1;
                  break;
                }
              }
              closedBracketIndex.push(
                tokens.slice(orOutsideBracket + 1, filteropenIndex)
              );

              //tokensArray[tokensArray.length-1].push({type:"filter",rule:"]",value: "filter-close"});
            } else {
              let filteropenIndex = -1;
              for (let j = tokens.length - 1; j >= 0; j--) {
                if (
                  tokens[j].value === "filter-open" &&
                  j < orIndex[orIndex.length - 1].inde
                ) {
                  filteropenIndex = j + 1;
                  break;
                }
              }
              closedBracketIndex.push(tokens.slice(0, filteropenIndex));
            }
            openBracketIndex.push(
              tokens.slice(
                orIndex[orIndex.length - 1].inde + 1,
                tokens.length + 1
              )
            );
            tokensArray.push(closedBracketIndex[0].concat(...openBracketIndex));
            //tokensArray[tokensArray.length-1].push({type:"filter",rule:"]",value: "filter-close"});
          }
        }
        console.log(tokensArray);
        return tokensArray;
    }

    differentiateOperator (tokens) {
        let bracketOpening = [];
        let bracketCloseing = [];
        let isbracketOpened = false;
        let isbracketClosed = false;
        let orIndex = [];
        let andIndex = [];
        let pipeIndex = [];
        for (let i =0;i<tokens.length;i++) {
            if (tokens[i].value == "filter-open") {
                bracketOpening.push(i);
                isbracketOpened = true;
            }
            if (tokens[i].value == "filter-close") {
                bracketCloseing.push(i);
                if (isbracketOpened) {
                    isbracketClosed = true;
                    isbracketOpened = false;
                }
            }
            if (isbracketOpened) {
                if (tokens[i].value === "or") {
                    console.log(tokens[i]);
                    orIndex.push({position:"inside brackets", inde:i});
                } 
                if (tokens[i].value === "pipe") {
                    console.log(tokens[i]);
                    pipeIndex.push({position:"inside brackets", inde:i});
                } 
                if (tokens[i].value === "and") {
                    console.log(tokens[i]);
                    andIndex.push({position:"inside brackets", inde:i});
                }
            } else if (tokens[i].value === "or"){
                console.log(tokens[i]);
                orIndex.push({position:"outside brackets",inde:i});
            } else if (tokens[i].value === "and") {
                console.log(tokens[i]);
                andIndex.push({position:"outside brackets",inde:i});
            }else if (tokens[i].value === "pipe") {
                console.log(tokens[i]);
                pipeIndex.push({position:"outside brackets",inde:i});
            }
        }
        console.log(orIndex);
        if (orIndex && orIndex.length > 0) {
            isOrCondition = true; 
            isPipeCondition = false;
            isAndCondition = false;
            return orIndex;
        } else if(andIndex && andIndex.length > 0) {
            orIndex = andIndex;
            isOrCondition = false;
            isPipeCondition = false;
            isAndCondition = true;
            return orIndex
        } else if(pipeIndex && pipeIndex.length > 0) {
            orIndex = pipeIndex
            isOrCondition = false;
            isAndCondition = false;
            isPipeCondition = true;
            return orIndex
        }else {
            return tokens;
        }
    }

    perform(node) {
        //console.log(this[TREE])
        // for (let i =0;i<this[TREE].length;i++) {
        //     treeArray.push(this[TREE][i].process(node));
        // }
        // this[TREE].forEach(tok=>{
        //     treeArray.push(tok.process(node));
        // })
        let nodeElementArray = [];
        let elementFound = [];
        treeArray.forEach( tre=>{
            let tr= tre.process(node);
            nodeElementArray.push(tr)
        })
        treeArray = [];

        if (isOrCondition) {
            elementFound = nodeElementArray.find(element => {
                return element.length>0;
              });//filter(element => element.length>0)
        } else if (isAndCondition) {
            elementFound = nodeElementArray[0].filter(element =>
                nodeElementArray.every(set => set.includes(element))
              );
        } else if (isPipeCondition) {
            elementFound = Array.from(nodeElementArray.reduce((acc, arr) => new Set([...acc, ...arr]), new Set()));
        }else {
            return nodeElementArray;
        }
        if (elementFound && elementFound.length > 0) {
            return elementFound;
        } else {
            return "no element found ";
        }
        
        //return nodeElementArray
    }

    static defineFunction() {
        //TODO
    }

}
// function checkIfOrIsInBrackets(toke) {
//     let bracketOpening = [];
//     let bracketCloseing = [];
//     let isbracketOpened = false;
//     let isbracketClosed = false;
//     let orinside = [];
//     for (let i =0;i<toke.length;i++) {
//         if (toke[i].value == "filter-open") {
//             bracketOpening.push(i);
//             isbracketOpened = true;
//         }
//         if (toke[i].value == "filter-close") {
//             bracketCloseing.push(i);
//             if (isbracketOpened) {
//                 isbracketClosed = true;
//                 isbracketOpened = false;

//             }
            
//         }
//         if (isbracketOpened) {
//             if (toke[i].value === "or") {
//                 console.log(toke[i]);
//                 orinside.push(i);
//             } 
//         }
        
//     }
//     //toke.filter((tok,i)=>{})

//     return orinside;
// }

function getTokens() {
    const tokens = [];
    while(this[TOKENIZER1].hasNext()) {
        tokens.push(this[TOKENIZER1].next());
    }
    return tokens;
}