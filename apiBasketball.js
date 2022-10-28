var graph = new jsGraphDisplay({
    margin: {
        top: 10,
        right: 30,
        bottom: 10,
        left: 10
    }
});

var display = {
    linkType: "bezier",
    linkWidth: "1",
    linkColor: "#FF0000",
    linkFromZero: false,
    linkDash: [],
    dataType: "rectangle",
    dataWidth: "4",
    dataColor: "#000"
}

/*graph.DataAdd({
    data: [
        [moment().subtract(130, 'days'), 21],
        [moment().subtract(114, 'days'), 23],
        [moment().subtract(94, 'days'), 26],
        [moment().subtract(80, 'days'), 25],
        [moment().subtract(64, 'days'), 20],
        [moment().subtract(54, 'days'), 22],
        [moment().subtract(30, 'days'), 27],
        [moment().subtract(10, 'days'), 35]
    ],
    display
});

display.linkColor = "#00AD1D"

graph.DataAdd({
    data: [
        [moment().subtract(130, 'days'), 17],
        [moment().subtract(114, 'days'), 29],
        [moment().subtract(94, 'days'), 40],
        [moment().subtract(80, 'days'), 25],
        [moment().subtract(64, 'days'), 21],
        [moment().subtract(54, 'days'), 15],
        [moment().subtract(30, 'days'), 12],
        [moment().subtract(10, 'days'), 27]
    ],
    display
});*/

/*
graph.DataAdd({
    data: [
        [ 3, 0.946409884890928 ],
        [ 4, 1.1489411987143128 ],
        [ 5, 0.881435102365335 ],
        [ 6, 0.9233564981228533 ],
        [ 7, 0.8747121766219694 ],
        [ 8, 0.8776052449965493 ],
        [ 9, 1.0107397699140819 ],
        [ 10, 0.8522700541049165 ],
        [ 11, 0.9087468982630272 ]
    ],
    display
});


display.linkColor = "#00AD1D"

graph.DataAdd({
    data: [
        [ 5, 0.9029091439402677 ],
        [ 6, 0.9646549734477332 ],
        [ 7, 0.9160509457374033 ],
        [ 8, 0.8783199524300702 ],
        [ 9, 0.973045563210727 ],
        [ 10, 0.8652394175429676 ],
        [ 11, 0.920035781767803 ]
    ],
    display
});
*/

Array.prototype.sum = function () {
    const sum = this.reduce((accumulator, value) => {
        return accumulator + value;
    }, 0);

    return sum
}

Array.prototype.average = function () {
    let tab = [...this]
    const sum = tab.reduce((accumulator, value) => {
        return accumulator + value;
    }, 0);

    return sum / tab.length
}

Object.prototype.average = function (key) {
    let obj = [...this]
    const sum = obj.reduce((accumulator, value) => {
        return accumulator + value[key];
    }, 0);

    return sum / obj.length
}

function EMA(tab, periode) {
    try {
        if (tab.length <= periode) throw new Error('Periode trop grande par rapport aux données disponobles')
        let tabEma = [...tab]
        if (typeof tabEma[0] === "number") {
            let valueForEMA = tabEma.pop()
            let tabForSM = tabEma.slice(-periode)
            let average = tabForSM.average()
            let lambda =  2 / (periode + 1)
            return (valueForEMA - average) * lambda + average
        } else if (typeof tabEma[0] === "object") {
            let keys = Object.keys(tabEma[0])
            let goodKey = null
            keys.forEach(key => {
                if (typeof tabEma[0][key] === "number") goodKey = key
            })
            let valueForEMA = tabEma.pop()
            let tabForSM = tabEma.slice(-periode)
            const sum = tabForSM.reduce((accumulator, value) => {
                return accumulator + value[goodKey];
            }, 0);
            let average = sum / tabForSM.length
            let lambda =  2 / (periode + 1)
            return (valueForEMA[goodKey] - average) * lambda + average
        }
        
    } catch (e) {
        console.log(e);
        return e
    }
}

let tab_NOP = [94 / 102, 107 / 71, 129 / 125, 107 / 101, 111 / 97, 103 / 120, 120 / 111, 130 / 108, 124 / 112, 121 / 122]
//let tab_NOP = [94 - 102, 107 - 71, 129 - 125, 107 - 101, 111 - 97, 103 - 120, 120 - 111, 130 - 108, 124 - 112, 121 - 122]
let tab_DM = [99 / 100, 82 / 83, 78 / 105, 89 / 100, 84 / 95, 98 / 96, 105 / 110, 115 / 101, 105 / 107, 137 / 96]
//let tab_DM = [99 - 100, 82 - 83, 78 - 105, 89 - 100, 84 - 95, 98 - 96, 105 - 110, 115 - 101, 105 - 107, 137 - 96]

let tab_DM2 = [110 / 120, 99 / 100, 82 / 83, 78 / 105, 89 / 100, 84 / 95, 98 / 96, 105 / 110, 115 / 101, 105 / 107]
let tab_MG = [120 / 84, 91 / 108, 87 / 90, 107 / 102, 109 / 97, 108 / 111, 105 / 109, 126 / 111, 115 / 112, 129 / 122]

let tab_WW = [88 / 106, 97 / 79, 87 / 77, 87 / 96, 95 / 104, 116 / 107, 89 / 105, 114 / 107, 102 / 100, 107 / 117]
let tab_DP = [87 / 101, 79 / 82, 102 / 86, 96 / 117, 101 / 107, 99 / 115, 111 / 126, 113 / 109, 106 / 130, 115 / 124]

let tab_IP = [96 / 103, 101 / 87, 79 / 97, 69 / 84, 122 / 97, 114 / 131, 109 / 100, 114 / 122, 107 / 114, 134 / 137]
let tab_DP2 = [105 / 99, 87 / 101, 79 / 82, 102 / 86, 96 / 117, 101 / 107, 99 / 115, 111 / 126, 113 / 109, 106 / 130]

let tab_REA = [100-69, 89-83, 93-79, 71-68, 76-71, 73-75, 96-79, 87-89, 72-56, 82-88]
let tab_virtus = [72-64, 72-69, 89-77, 66-83, 85-80, 66-63, 85-60, 65-68, 62-90, 97-71]

let tab_BOT = [0/1, 3/1, 0, 2, 1, 1/3, 2/1, 1, 0, 2/2]
let tab_BOT2 = [2/2, -1, 3/1, 0, 2, 1, 1/3, 2/1, 1, -1]
let tab_BOT3 = [0, 2/2, -1, 3/1, 0, 2, 1, 1/3, 2/1, 1]
//let tab_BOT3 = [0, 2/2, 0, 3/1, 0, 2, 1, 1/3, 2/1, 1]
let tab_INT = [3, 1, 4, 2/2, 1, 2/1, 0, 1, 0, 4/2]
let tab_FLU = [1, -1, 2/1, -3, 2/1, 4, -2, 2/3, -2, 3]

//let tab_PAR = [2/1, 1, 3/1, 1, 2/1, 0, 0, 0, 1, 3]
let tab_PAR = [2-1, 1, 3-1, 1, 2-1, 0, 0, 0, 1, 3]
//let tab_MAC = [-2, 3/1, -1/3, -3, 2, -1/3, -1, 2, 1, 3/2]
let tab_MAC = [-2, 3-1, 1-3, -3, 2, 1-3, -1, 2, 1, 3-2]
//let tab_MAC = [-2, 3/1, -3/1, -3, 2, -3/1, -1, 2, 1, 3/2]
//let tab_MAC = [0, 3/1, 1/3, 0, 2, 1/3, 0, 2, 1, 3/2]

let tab_testObj = [{date: "maDate", number: -1/3}, {date: "maDate", number: -1}, {date: "maDate", number: 2}, {date: "maDate", number: 1}, {date: "maDate", number: 3/2}]

//console.log(EMA(tab_testObj, 2))
//console.log(tab_testObj);


let tab = tab_REA

let tab2 = []
const periode2 = 2
console.log('P 2:');
for (let index = 1; index <= tab.length; index++) {
    if (index > periode2) {
        tab2.push([index, EMA(tab.slice(0, index), periode2)]);
    }    
}

let tab4 = []
const periode4 = 4
console.log('P 4:');
for (let index = 1; index <= tab.length; index++) {
    if (index > periode4) {
        tab4.push([index, EMA(tab.slice(0, index), periode4)]);
    }    
}

let tab6 = []
const periode6 = 6
console.log('P 6:');
for (let index = 1; index <= tab.length; index++) {
    if (index > periode6) {
       tab6.push([index, EMA(tab.slice(0, index), periode6)]);
    }
}

let tabN = []
console.log('P N:');
for (let index = 1; index <= tab.length; index++) {
    tabN.push([index, tab[index-1]]);
}

/** 2 */

graph.DataAdd({
    data: tab2,
    display
});

/** 4 */

display.linkColor = "#00AD1D"

graph.DataAdd({
    data: tab4,
    display
});

/** 6 */

display.linkColor = "#FFBD00"

graph.DataAdd({
    data: tab6,
    display
});

/** NORM */

display.linkColor = "#000000"

graph.DataAdd({
    data: tabN,
    display
});

graph.Draw('canvas');
