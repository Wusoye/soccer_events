app.get('/', (req, res) => {
    tab_l = [4, -11, 1, -3, -5]
    tab_v = [-8, 10, -13, 13, 6]
    his_l = []
    his_v = []
    nb = 5
    /*tab_l[0] = tab_l[0] * 5
    tab_l[1] = tab_l[1] * 4
    tab_l[2] = tab_l[2] * 3
    tab_l[3] = tab_l[3] * 2
    tab_l[4] = tab_l[4] * 1

    tab_v[0] = tab_v[0] * 5
    tab_v[1] = tab_v[1] * 4
    tab_v[2] = tab_v[2] * 3
    tab_v[3] = tab_v[3] * 2
    tab_v[4] = tab_v[4] * 1*/

    his_l[0] = tab_l[0]
    his_l[1] = (tab_l[0] + tab_l[1]) / 2
    his_l[2] = (tab_l[0] + tab_l[1] + tab_l[2]) / 3
    his_l[3] = (tab_l[0] + tab_l[1] + tab_l[2] + tab_l[3]) / 4
    his_l[4] = (tab_l[0] + tab_l[1] + tab_l[2] + tab_l[3] + tab_l[4]) / 5

    his_v[0] = tab_v[0]
    his_v[1] = (tab_v[0] + tab_v[1]) / 2
    his_v[2] = (tab_v[0] + tab_v[1] + tab_v[2]) / 3
    his_v[3] = (tab_v[0] + tab_v[1] + tab_v[2] + tab_v[3]) / 4
    his_v[4] = (tab_v[0] + tab_v[1] + tab_v[2] + tab_v[3] + tab_v[4]) / 5

    //console.log(numAverage(tab_l), numAverage(tab_v));
    console.log(his_l, his_v);
    console.log(numAverage(his_l), numAverage(his_v));
})
