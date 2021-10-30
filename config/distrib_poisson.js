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

    this.predict_proba = function (prob_percent) {

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
                
            }
        }

        if (prob_percent) {
            return [home_prob, draw_prob, away_prob]
        }
        else {
            return [home_prob*100, draw_prob*100, away_prob*100]
        }
        
    }

    this.show_distrib = function() {
        console.log("local: ", local_distrib, "visitor: ", visitor_distrib);
    }

}