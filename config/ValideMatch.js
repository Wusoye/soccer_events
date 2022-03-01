module.exports = class ValideMatch {
    #local_note
    #visitor_note
    #local_tilt
    #visitor_tilt
    #delta_tilt
    #classe = 'table-default';
    #ouverture = '';

    constructor(local_note, visitor_note, local_tilt, visitor_tilt){
        this.#local_note = parseInt(local_note);
        this.#visitor_note = parseInt(visitor_note);
        this.#local_tilt = parseInt(local_tilt);
        this.#visitor_tilt = parseInt(visitor_tilt);
        this.#delta_tilt = Math.abs(parseInt(local_tilt) - parseInt(visitor_tilt))
        this.#initializeOuverture();
    }

    #initializeOuverture() {
        if (this.#delta_tilt <= 25) {
            if (this.#local_tilt <= 55 && this.#local_tilt >= -55 && this.#local_tilt < this.#visitor_tilt) {
                if (this.#local_note < 40) {
                    this.#ouverture = '1N ' + this.#local_note;
                    this.#classe = 'table-info';
                } else {
                    this.#ouverture = '1N';
                    this.#classe = 'table-success';
                }
            }
            if (this.#visitor_tilt <= 55 && this.#visitor_tilt >= -55 && this.#visitor_tilt < this.#local_tilt) {
                if (this.#visitor_note < 40) {
                    this.#ouverture = 'N2 ' + this.#visitor_note;
                    this.#classe = 'table-info';
                } else {
                    this.#ouverture = 'N2';
                    this.#classe = 'table-success';
                }
            }
        }
    }

    getClasse(){
        return this.#classe;
    }

    getOuverture(){
        return this.#ouverture;
    }
}