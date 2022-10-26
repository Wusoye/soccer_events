Array.prototype.sum = function () {
    const sum = this.reduce((accumulator, value) => {
        return accumulator + value;
    }, 0);

    return sum
}

Array.prototype.average = function (periode) {
    let tab = [...this].slice(-periode)
    const sum = tab.reduce((accumulator, value) => {
        return accumulator + value;
    }, 0);

    return sum / tab.length
}


function MME(tab, periode, nbmatch) {
    if (nbmatch < tab.length) {
        a = tab.length - nbmatch - 1
        b = tab.length
        tab = tab.slice(a, b)
    }
    history_MME = []
    nbmatch = tab.length
    const_mme = 2 / (periode + 1)

    vi_ema_for_local = 0

    for (let index_2 = periode; index_2 < nbmatch; index_2++) {

        if (index_2 - 1 == periode) {
            for (let index = 0; index < periode; index++) {
                vi_ema_for_local = tab[index]
            }
            vi_ema_for_local = vi_ema_for_local / 2
        }

        vi_ema_for_local = (tab[index_2] - vi_ema_for_local) * const_mme + vi_ema_for_local

        history_MME.push(vi_ema_for_local)
        mme = vi_ema_for_local

        tab[index_2] = { ...tab[index_2], mme }
    }

    return tab
}

function EMA(tab, periode) {
    try {
        if (tab.length <= periode) throw new Error('Periode trop grande par rapport aux données disponobles')
        let valueForEMA = [...tab].pop()
        let tabForSM = [...tab].slice(-periode)
        let average = tabForSM.average()
        let lambda =  2 / (periode + 1)
        return (valueForEMA - average) * lambda + average
    } catch (e) {
        console.log(e);
        return e
    }
}

let tab_NOP = [94 / 102, 107 / 71, 129 / 125, 107 / 101, 111 / 97, 103 / 120, 120 / 111, 130 / 108, 124 / 112, 121 / 122, 113 / 111]
let tab_DM = [99 / 100, 82 / 83, 78 / 105, 89 / 100, 84 / 95, 98 / 96, 105 / 110, 115 / 101, 105 / 107, 137 / 96]

let tab_DM2 = [110 / 120, 99 / 100, 82 / 83, 78 / 105, 89 / 100, 84 / 95, 98 / 96, 105 / 110, 115 / 101, 105 / 107]
let tab_MG = [120 / 84, 91 / 108, 87 / 90, 107 / 102, 109 / 97, 108 / 111, 105 / 109, 126 / 111, 115 / 112, 129 / 122]

let tab_WW = [88 / 106, 97 / 79, 87 / 77, 87 / 96, 95 / 104, 116 / 107, 89 / 105, 114 / 107, 102 / 100, 107 / 117]
let tab_DP = [87 / 101, 79 / 82, 102 / 86, 96 / 117, 101 / 107, 99 / 115, 111 / 126, 113 / 109, 106 / 130, 115 / 124]

let tab_IP = [96 / 103, 101 / 87, 79 / 97, 69 / 84, 122 / 97, 114 / 131, 109 / 100, 114 / 122, 107 / 114, 134 / 137]
let tab_DP2 = [105 / 99, 87 / 101, 79 / 82, 102 / 86, 96 / 117, 101 / 107, 99 / 115, 111 / 126, 113 / 109, 106 / 130]



let tab = tab_NOP
const periode = 4

for (let index = 1; index <= tab.length; index++) {
    if (index > periode) {
        console.log([index, EMA(tab.slice(0, index), periode)]);
    }    
}
