function fact(nbr) {
    var i, nbr, f = 1;
    for (i = 1; i <= nbr; i++) {
        f = f * i;   // ou f *= i;
    }
    return f;
}

module.exports = function (local_predict, visitor_predict, max_goal) {

    //console.log(max_goal);

    local_distrib = []
    visitor_distrib = []
    matrice_goals = {}
    local_lambda = local_predict
    visitor_lambda = visitor_predict

    for (let i = 0; i <= max_goal; i++) {

        k = i
        kFact = fact(i)

        local = Math.exp(-local_lambda) * (Math.pow(local_lambda, k) / kFact)
        visitor = Math.exp(-visitor_lambda) * (Math.pow(visitor_lambda, k) / kFact)

        local_distrib.push(local)
        visitor_distrib.push(visitor)

    }

    //console.log(parseFloat(1/(local_distrib[1]+local_distrib[2]+local_distrib[3]+local_distrib[4]+local_distrib[5])));

    this.predict_goals = function(prob_percent) {
        if (prob_percent) {
            return [local_distrib, visitor_distrib]
        } else {
            for (let k = 0; k < max_goal; k++) {
                local_distrib[k] = local_distrib[k] * 100
                visitor_distrib[k] = visitor_distrib[k] * 100
            }
            return [local_distrib, visitor_distrib]
        }
    }

    this.predict_proba = function () {

        home_prob = 0
        draw_prob = 0
        away_prob = 0

        for (let local_i = 0; local_i < local_distrib.length; local_i++) {
            for (let visitor_i = 0; visitor_i < visitor_distrib.length; visitor_i++) {

                local_prob_score = local_distrib[local_i]
                visitor_prob_score = visitor_distrib[visitor_i]
                

                if (local_i > visitor_i) {
                    home_prob = local_prob_score * visitor_prob_score + home_prob
                }
                if (local_i == visitor_i) {
                    draw_prob = local_prob_score * visitor_prob_score + draw_prob
                }
                if (local_i < visitor_i) {
                    away_prob = local_prob_score * visitor_prob_score + away_prob
                }

                if (local_i <= 5 && visitor_i <= 5) {
                    
                    score = String(local_i + '-' + visitor_i)
                    matrice_goals[score] = local_prob_score * visitor_prob_score
                }

            }
        }

        matrice_goals['proba'] = [home_prob, draw_prob, away_prob]
        matrice_goals['percent'] = [home_prob * 100, draw_prob * 100, away_prob * 100]
        //console.log(matrice_goals);
        return matrice_goals

    }

    this.show_distrib = function () {
        console.log("local: ", local_distrib, "visitor: ", visitor_distrib);
    }

}