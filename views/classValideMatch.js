class ValideMatch {
    #coefLeague
    #IsPricipalLeague = false;
    #IsPricipalTeams = false;
    #IsAvailable = false;

    #delta_elo = 0;
    #local_note
    #visitor_note
    #local_elo
    #visitor_elo
    #local_tilt
    #visitor_tilt
    #delta_tilt
    #local_xg
    #visitor_xg
    #classe = 'table-default';
    #isOpen = false;
    #maxGoal = 25;
    #home_prob = 0;
    #draw_prob = 0;
    #away_prob = 0;
    #limitPercent = 0.405;
   
   
    constructor(local_note, visitor_note, local_tilt, visitor_tilt, local_xg, visitor_xg, local_elo, visitor_elo, coefLeague){
        this.#coefLeague = parseFloat(coefLeague);
        this.#IsPricipalLeague = this.#coefLeague > 40;
        this.#local_note = parseInt(local_note);
        this.#visitor_note = parseInt(visitor_note);
        this.#IsPricipalTeams = this.#local_note > 30 && this.#visitor_note > 30;
        this.#local_tilt = parseInt(local_tilt);
        this.#visitor_tilt = parseInt(visitor_tilt);
        this.#delta_tilt = (parseInt(local_tilt) - parseInt(visitor_tilt));
        this.#local_xg = parseFloat(local_xg);
        this.#visitor_xg = parseFloat(visitor_xg);
        this.#IsAvailable = this.#local_xg > 0 && this.#visitor_xg > 0;
        this.#local_elo = parseInt(local_elo);
        this.#visitor_elo = parseInt(visitor_elo);
        if(parseInt(local_elo) != 625 && parseInt(visitor_elo) != 625){
            if(parseInt(local_elo) > parseInt(visitor_elo)){
                this.#delta_elo = (((parseInt(visitor_elo) - parseInt(local_elo)) / parseInt(local_elo)) * 100).toFixed(2)
            } else if(parseInt(local_elo) < parseInt(visitor_elo)){
                this.#delta_elo = (((parseInt(local_elo) - parseInt(visitor_elo)) / parseInt(visitor_elo)) * 100).toFixed(2)
            }
        }
        this.#poissonPourcent();
        this.#ouverture();
    }

    #fact(nbr) {
        var i, nbr, f = 1;
        for (i = 1; i <= nbr; i++) {
            f = f * i;   // ou f *= i;
        }
        return f;
    }

    #poissonPourcent(){

        this.local_distrib = []
        this.visitor_distrib = []

        for (let i = 0; i <= this.#maxGoal; i++) {

            this.k = i
            this.kFact = this.#fact(i)

            this.local = Math.exp(-this.#local_xg) * (Math.pow(this.#local_xg, this.k) / this.kFact)
            this.visitor = Math.exp(-this.#visitor_xg) * (Math.pow(this.#visitor_xg, this.k) / this.kFact)

            this.local_distrib.push(this.local)
            this.visitor_distrib.push(this.visitor)
            
        }

        for (let local_i = 0; local_i < this.local_distrib.length; local_i++) {
            for (let visitor_i = 0; visitor_i < this.visitor_distrib.length; visitor_i++) {

                this.local_prob_score = this.local_distrib[local_i]
                this.visitor_prob_score = this.visitor_distrib[visitor_i]
                

                if (local_i > visitor_i) {
                    this.#home_prob = this.local_prob_score * this.visitor_prob_score + this.#home_prob
                }
                if (local_i == visitor_i) {
                    this.#draw_prob = this.local_prob_score * this.visitor_prob_score + this.#draw_prob
                }
                if (local_i < visitor_i) {
                    this.#away_prob = this.local_prob_score * this.visitor_prob_score + this.#away_prob
                }
            }
        }
    }

    #ouverture(){
        /*
        if (this.#home_prob > this.#limitPercent){
            
            if ((this.#delta_tilt > 5 && this.#delta_tilt < 85 && this.#delta_elo > -35 )) {
                this.#classe = 'table-success';
                this.#isOpen = true;
            } else if((this.#delta_tilt > 85 && this.#delta_elo > -35 ) || (this.#delta_tilt > 5 && this.#delta_tilt < 85 && this.#delta_elo < -35)){
                this.#classe = 'table-warning';
                this.#isOpen = true;
            }

        } else if (this.#away_prob > this.#limitPercent) {

            if ((this.#delta_tilt < -5 && this.#delta_tilt > -85 && this.#delta_elo > -35)) {
                this.#classe = 'table-success';
                this.#isOpen = true;
            } else if((this.#delta_tilt < -85 && this.#delta_elo > -35) || (this.#delta_tilt < -5 && this.#delta_tilt > -85 && this.#delta_elo < -35)){
                this.#classe = 'table-warning';
                this.#isOpen = true;
            }
        }
        */
       /*
        if ((this.#delta_tilt > 5 || this.#delta_tilt < -5)){
            this.#classe = 'table-success';
            if (this.#delta_elo < -20) {
                this.#classe = 'table-info';
                if (this.#delta_elo < -45) {
                    this.#classe = 'table-warning';
                }
            }
            this.#isOpen = true;
        }
        */

        /*
        if ((this.#local_note > this.#visitor_note || this.#local_elo > 1500) && this.#delta_tilt < -5){
            this.#isOpen = true;
            this.#classe = 'table-success';
            if (this.#local_elo < this.#visitor_elo){
                this.#classe = 'table-info';
            }
        } else if ((this.#local_note < this.#visitor_note || this.#visitor_elo > 1500) && this.#delta_tilt > 5){
            this.#isOpen = true;
            this.#classe = 'table-success';
            if (this.#local_elo > this.#visitor_elo){
                this.#classe = 'table-info';
            }
        }
        */
        /*
        if (this.#local_xg > this.#visitor_xg && this.#local_tilt + 10 < this.#visitor_tilt) {
            this.#isOpen = true;
            this.#classe = 'table-success';
        } else if (this.#local_xg < this.#visitor_xg && this.#local_tilt > this.#visitor_tilt + 10){
            this.#isOpen = true;
            this.#classe = 'table-success';
        }
        */
       /*
        if (this.#local_tilt < -10 && this.#visitor_tilt > 10){
            this.#isOpen = true;
            this.#classe = 'table-success';
            if (this.#local_xg > this.#visitor_xg){
                this.#classe = 'table-info';
            }
        } else if (this.#local_tilt > 10 && this.#visitor_tilt < -10){
            this.#isOpen = true;
            this.#classe = 'table-success';
            if (this.#local_xg < this.#visitor_xg){
                this.#classe = 'table-info';
            }
        }
        */
       
        if (this.#local_tilt > this.#visitor_tilt + 15){
            this.#isOpen = true;
            this.#classe = 'table-info';
        } else if (this.#local_tilt + 15 < this.#visitor_tilt){
            this.#isOpen = true;
            this.#classe = 'table-success';
        }
        
       if (this.#local) {
           
       }
    }

    getClass(){         
        return this.#classe;
    }

    getOuverture(){         
        return this.#isOpen;
    }

    getInfos(){
        //return this.#local_note + ' / ' + this.#visitor_note + ' | ' + this.#local_tilt + ' / ' + this.#visitor_tilt + ' | Δ' + this.#delta_tilt;
        //this.res = this.#local_elo + ' / ' + this.#visitor_elo + ' | Δ' + this.#delta_tilt;
        this.res = 'Δ' + this.#delta_elo + ' | ' + this.#local_elo + ' / ' + this.#visitor_elo + ' | Δ' + this.#delta_tilt+ ' | ' + this.#local_tilt + ' / ' + this.#visitor_tilt;
        /*
        if ((this.#local_note > this.#visitor_note || this.#local_elo > 1500) && this.#delta_tilt < -5){
            this.res = '1 | ' + this.res;
        } else if ((this.#local_note < this.#visitor_note || this.#visitor_elo > 1500) && this.#delta_tilt > 5){
            this.res = '2 | ' + this.res;
        }*/
        /*
        if (this.#local_tilt + 10 < this.#visitor_tilt) {
            this.res = '1 | ' + this.res;
        } else if (this.#local_tilt > this.#visitor_tilt + 10){
            this.res = '2 | ' + this.res;
        }*/
        if (this.#local_tilt > this.#visitor_tilt){
            this.res = '1 | ' + this.res;
        } else if (this.#local_tilt < this.#visitor_tilt){
            this.res = '2 | ' + this.res;
        }
        return this.res;
    }

    getNote(){
        return this.#local_note + ' | ' + this.#visitor_note;
    }

    getIsPricipalLeague(){
        return this.#IsPricipalLeague;
    }

    getIsPricipalTeams(){
        return this.#IsPricipalTeams;
    }

    getIsAvailable(){
        return this.#IsAvailable;
    }

    getCoefLeague(){
        return this.#coefLeague;
    }

    getDeltaElo(){
        return this.#delta_elo;
    }

    getGoalPredict(noTilt){
        this.local_goal = this.#local_xg;
        this.visitor_goal = this.#visitor_xg;
        if (noTilt) {
            this.local_goal = this.#local_xg / (1 + this.#local_tilt / 100);
            this.visitor_goal = this.#visitor_xg / (1 + this.#visitor_tilt / 100);
        }
        return [(this.local_goal).toFixed(2), (this.visitor_goal).toFixed(2)];
    }
}