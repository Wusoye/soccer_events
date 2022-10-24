// http://blog.niap3d.com/jsGraphDisplay
function jsGraphDisplay(aData) {
    var me = this;

    // objet pour dessiner dans un svg
    me.SVGInit = function (aDomEl, aParent) {
        var me = this;
        // ligne
        me.Line = function (pt, opt, logOk) {
            var path = "", bezier, i, j, e = me.Element('path');
            for (i = 0, j = pt.length; i < j; i++) {
                if (path == "") {
                    path = "M " + pt[i][0] + "," + pt[i][1];
                    continue;
                }
                switch (opt.type) {
                    case "bezier":
                        bezier = me.parent.BezierCalc(pt[i - 1], pt[i], pt[i + 1]);
                        if (i == 1) path += " C " + pt[i - 1][0] + "," + pt[i - 1][1] + " " + (pt[i][0] + bezier[0]) + ", " + (pt[i][1] + bezier[1]);
                        else path += " S " + (pt[i][0] + bezier[0]) + ", " + (pt[i][1] + bezier[1]);
                        break;
                    default:
                        path += " L";
                }
                path += " " + pt[i][0] + ", " + pt[i][1];
            }
            e.setAttribute("d", path);
            e.setAttribute("fill", "none");
            if (opt.dash) e.setAttribute("stroke-dasharray", opt.dash);
            if (opt.color) e.style.stroke = opt.color;
            e.style.strokeWidth = opt.width;
            me.domElement.appendChild(e);
        }

        // triangle
        me.Triangle = function (pt1, pt2, pt3, opt) {
            var e = me.Element('polygon');
            e.setAttribute("points", +pt1[0] + "," + pt1[1] + " " + pt2[0] + "," + pt2[1] + " " + pt3[0] + "," + pt3[1]);
            if (opt.color) e.setAttribute("fill", opt.color);
            me.domElement.appendChild(e);
        }

        // rectangle
        me.Rectangle = function (pt, width, height, opt) {
            var e = me.Element('rect');
            e.setAttribute("x", pt[0]);
            e.setAttribute("y", pt[1]);
            e.setAttribute("width", width);
            e.setAttribute("height", height);
            if (opt.color) e.setAttribute("fill", opt.color);
            me.domElement.appendChild(e);
        }

        // cercle
        me.Circle = function (pt, width, opt) {
            var e = me.Element('circle');
            e.setAttribute("cx", pt[0]);
            e.setAttribute("cy", pt[1]);
            e.setAttribute("r", width);
            if (opt.color) e.setAttribute("fill", opt.color);
            me.domElement.appendChild(e);
        }

        // texte
        me.Text = function (txt, pt, opt) {
            var e = me.Element('text'), attr;
            e.setAttribute("x", pt[0]);
            e.setAttribute("y", pt[1]);
            e.innerHTML = txt;
            if (opt.color) e.style.fill = opt.color;
            if (opt.fontSize) e.setAttribute("font-size", opt.fontSize);
            if (opt.textBaseline) {
                switch (opt.textBaseline) {
                    case 'top':
                        attr = "hanging";
                        break;
                    case 'bottom':
                        attr = "baseline";
                        break;
                    default:
                        attr = "middle";
                }
                e.setAttribute("alignment-baseline", attr);
            }
            if (opt.textAlign) {
                switch (opt.textAlign) {
                    case 'left':
                        attr = "start";
                        break;
                    case 'right':
                        attr = "end";
                        break;
                    default:
                        attr = "middle";
                }
                e.style.textAnchor = attr;
            }
            if (opt.rotation) e.setAttribute("transform", "rotate(" + opt.rotation + ", " + pt[0] + ", " + pt[1] + ")");
            me.domElement.appendChild(e);

        }

        me.Element = function (aType) {
            return document.createElementNS("http://www.w3.org/2000/svg", aType);
        }

        me.domElement = aDomEl;
        me.parent = aParent;
        return me;
    }

    // objet pour dessiner dans un canvas
    me.CanvasInit = function (aDomEl, aParent) {
        var me = this;
        // ligne
        me.Line = function (pt, opt) {
            if (opt.width) me.context.lineWidth = opt.width;
            if (opt.color) me.context.strokeStyle = opt.color;
            if (opt.dash) me.context.setLineDash(opt.dash);
            me.context.beginPath();
            me.context.moveTo(pt[0][0], pt[0][1]);
            var oldBezier = [0, 0], bezier;
            for (i = 1, j = pt.length; i < j; i++) {
                switch (opt.type) {
                    case "bezier":
                        bezier = me.parent.BezierCalc(pt[i - 1], pt[i], pt[i + 1]);
                        me.context.bezierCurveTo(pt[i - 1][0] - oldBezier[0], pt[i - 1][1] - oldBezier[1], pt[i][0] + bezier[0], pt[i][1] + bezier[1], pt[i][0], pt[i][1]);
                        oldBezier = bezier;
                        break;
                    default:
                        me.context.lineTo(pt[i][0], pt[i][1]);
                }
            }
            me.context.stroke();
        }

        // triangle
        me.Triangle = function (pt1, pt2, pt3, opt) {
            if (opt.color) me.context.strokeStyle = opt.color;
            me.context.beginPath();
            me.context.moveTo(pt1[0], pt1[1]);
            me.context.lineTo(pt2[0], pt2[1]);
            me.context.lineTo(pt3[0], pt3[1]);
            me.context.fill();
        }

        // rectangle
        me.Rectangle = function (pt, width, height, opt) {
            if (opt.color) me.context.fillStyle = opt.color;
            me.context.strokeStyle = "";
            me.context.beginPath();
            me.context.rect(pt[0], pt[1], width, height);
            me.context.fill();
        }

        // cercle
        me.Circle = function (pt, width, opt) {
            if (opt.color) me.context.fillStyle = opt.color;
            me.context.beginPath();
            me.context.arc(pt[0], pt[1], width, 0, 2 * Math.PI);
            me.context.fill();
        }

        // texte
        me.Text = function (txt, pt, opt) { 
            if (opt.fontSize) me.context.font = opt.fontSize + "px Arial";
            if (opt.textBaseline) me.context.textBaseline = opt.textBaseline;
            if (opt.width) me.context.lineWidth = opt.width;
            if (opt.color) me.context.fillStyle = opt.color;
            if (opt.textAlign) me.context.textAlign = opt.textAlign;
            if (opt.rotation) {
                me.context.save();
                me.context.translate(pt[0], pt[1]);
                me.context.rotate(opt.rotation / 180 * Math.PI);
                me.context.fillText(txt, 0, 0);
                me.context.restore();
            } else me.context.fillText(txt, pt[0], pt[1]);
        }
        me.context = aDomEl.getContext('2d');
        me.parent = aParent;
        return me;
    }

    // dessine le graphique dans un Ã©lÃ©ment
    me.Draw = function (aId, aDataTitle) {
        var el, limitL, limitR, limitT, limitB, lineH, ratioX, ratioY, objDraw, i, j, x, y, lineLst, pointLst, tmp;
        el = document.getElementById(aId);
        if (!el) {
            console.warn('jsSimpleGraph : DOM element #' + aId + ' not found');
            return 0;
        }
        // cherche le type d'Ã©lÃ©ment
        switch (el.tagName) {
            case 'CANVAS':
                if (!el.getContext) {
                    console.warn('jsSimpleGraph : Browser incompatible with getContext');
                    return 0;
                }
                objDraw = me.CanvasInit(el, this);
                break;

            case 'svg':
                objDraw = me.SVGInit(el, this);
                break;

            default:
                console.warn('jsSimpleGraph : Element need to be canvas or SVG (' + el.tagName + ')');
                return 0;
                break;
        }
        // calcul les limites de dessin
        lineH = 5;
        limitL = me.margin.left + (me.axe.y.title ? (me.axe.y.textSize + lineH) : 0) + (!me.axe.y.textDisplayEvery ? 0 : (me.axe.y.max.toString().length * me.axe.y.textSize * 0.7 + lineH));
        limitR = el.getBoundingClientRect().width - me.margin.right;
        limitT = me.margin.top;
        limitB = el.getBoundingClientRect().height - me.margin.bottom - (me.axe.x.title ? (me.axe.x.textSize + lineH) : 0) - (!me.axe.x.textDisplayEvery ? 0 : (me.axe.x.textSize + lineH));
        ratioX = (me.axe.x.max - me.axe.x.min) / (limitR - limitL);
        ratioY = (me.axe.y.max - me.axe.y.min) / (limitB - limitT);

        // ordonnÃ©e et abscisse
        objDraw.Line([[limitL, limitT], [limitL, limitB], [limitR, limitB]], { type: "line", width: me.axe.width, color: me.axe.color });
        if (me.axe.arrow) {
            objDraw.Triangle([limitL, limitT - lineH], [limitL - lineH, limitT], [limitL + lineH, limitT], { color: me.axe.color });
            objDraw.Triangle([limitR + lineH, limitB], [limitR, limitB + lineH], [limitR, limitB - lineH], { color: me.axe.color });
        }

        // titre des axes
        if (me.axe.x.title) {
            objDraw.Text(me.axe.x.title, [limitL + (limitR - limitL) / 2, el.getBoundingClientRect().height], { fontSize: me.axe.x.textSize, textBaseline: "bottom", textAlign: "center", color: me.axe.x.textColor });
        }
        if (me.axe.y.title) {
            objDraw.Text(me.axe.y.title, [0, limitT + (limitB - limitT) / 2], { fontSize: me.axe.y.textSize, textBaseline: "top", textAlign: "center", rotation: -90, color: me.axe.y.textColor });
        }

        // traits sur axe X
        j = (me.axe.x.max - me.axe.x.min) / me.axe.x.step;
        for (i = 1; i <= j; i++) {
            x = limitL + me.axe.x.step * i / ratioX;
            if (me.grid.x.width) objDraw.Line([[x, limitB - lineH], [x, limitT]], { type: "line", width: me.grid.x.width, color: me.grid.y.color });
            objDraw.Line([[x, limitB - lineH], [x, limitB + lineH]], { type: "line", width: me.axe.width, color: me.axe.color });
            if (i % me.axe.x.textDisplayEvery == 0) {
                tmp = me.axe.x.min + i * me.axe.x.step;
                if (me.axe.x.list) tmp = me.axe.x.list[(tmp / me.axe.x.max * me.axe.x.list.length) - 1];
                //else tmp = Math.floor(tmp);
                else tmp = moment(tmp).format('DD MMM YY');
                objDraw.Text(tmp, [x, limitB + lineH * 2], { fontSize: me.axe.x.textSize, color: me.axe.x.textColor, textBaseline: "top", textAlign: "center" });
            }
        }

        // traits sur axe Y
        j = (me.axe.y.max - me.axe.y.min) / me.axe.y.step;
        for (i = 1; i <= j; i++) {
            y = limitB - me.axe.y.step * i / ratioY;
            if (me.grid.y.width) objDraw.Line([[limitL + lineH, y], [limitR, y]], { type: "line", width: me.grid.y.width, color: me.grid.y.color });
            objDraw.Line([[limitL - lineH, y], [limitL + lineH, y]], { type: "line", width: me.axe.width, color: me.axe.color });
            if (i % me.axe.y.textDisplayEvery == 0) {
                tmp = me.axe.y.min + i * me.axe.y.step;
                if (me.axe.y.list) tmp = me.axe.y.list[(tmp / me.axe.y.max * me.axe.y.list.length) - 1];
                else tmp = Math.floor(tmp);
                objDraw.Text(tmp, [limitL - lineH * 2, y], { fontSize: me.axe.y.textSize, color: me.axe.y.textColor, textBaseline: "middle", textAlign: "right" });
            }
        }

        // affiche les donnÃ©es
        for (i = 0; i < me.dataLst.length; i++) {
            if (aDataTitle instanceof Array && aDataTitle.indexOf(me.dataLst[i].title) === -1) continue;
            if (typeof (aDataTitle) == 'string' && me.dataLst[i].title !== aDataTitle) continue;
            lineLst = 0;
            pointLst = [];

            // lien entre les donnÃ©es
            for (j = 0; j < me.dataLst[i].data.length; j++) {
                x = limitL + (me.dataLst[i].data[j][0] - me.axe.x.min) / ratioX;
                y = limitB - (me.dataLst[i].data[j][1] - me.axe.y.min) / ratioY;
                pointLst.push({ x: x, y: y });
                if (me.dataLst[i].display.linkWidth > 0) {
                    switch (me.dataLst[i].display.linkType) {
                        case "toTop":
                        case "toBottom":
                            objDraw.Line([[x, me.dataLst[i].display.linkType == "toTop" ? limitT : limitB], [x, y]], { type: "line", width: me.dataLst[i].display.linkWidth, color: me.dataLst[i].display.linkColor, dash: me.dataLst[i].display.linkDash });
                            break;
                        default:
                            if (!lineLst) lineLst = [];
                            if (j == 0 && me.dataLst[i].display.linkFromZero) lineLst = [[limitL, limitB]];
                            lineLst.push([x, y]);
                    }
                }
            }
            // dessine le lien
            if (lineLst) {
                objDraw.Line(lineLst, { type: me.dataLst[i].display.linkType, width: me.dataLst[i].display.linkWidth, color: me.dataLst[i].display.linkColor, dash: me.dataLst[i].display.linkDash });
            }

            // donnÃ©es
            for (j = 0; j < pointLst.length; j++) {
                x = pointLst[j].x;
                y = pointLst[j].y;
                switch (me.dataLst[i].display.dataType) {
                    case "rectangle":
                        objDraw.Rectangle([x - me.dataLst[i].display.dataWidth / 2, y - me.dataLst[i].display.dataWidth / 2], me.dataLst[i].display.dataWidth, me.dataLst[i].display.dataWidth, { color: me.dataLst[i].display.dataColor });
                        break;
                    case "circle":
                        objDraw.Circle([x, y], me.dataLst[i].display.dataWidth / 2, { color: me.dataLst[i].display.dataColor });
                }
            }
        }
    }

    // ajoute des donnÃ©es
    me.DataAdd = function (aData) {
        var l = [], i, xMin, xMax, yMin, yMax;
        l.title = me.VarInit(aData, "title", "");
        l.data = me.VarInit(aData, "data", []);
        if (l.data.length <= 0) return 0;
        for (i = 0; i < l.data.length; i++) {
            if (l.data[i][0] < xMin || xMin === undefined) xMin = l.data[i][0];
            if (l.data[i][0] > xMax || xMax === undefined) xMax = l.data[i][0];
            if (l.data[i][1] < yMin || yMin === undefined) yMin = l.data[i][1];
            if (l.data[i][1] > yMax || yMax === undefined) yMax = l.data[i][1];
        }
        l.limit = {};
        l.limit.x = { min: xMin, max: xMax };
        l.limit.y = { min: yMin, max: yMax };
        l.display = {};
        l.display.linkWidth = me.VarInit(aData, "display.linkWidth", 1);
        l.display.linkColor = me.VarInit(aData, "display.linkColor", "#ccc");
        l.display.linkDash = me.VarInit(aData, "display.linkDash", []);
        l.display.linkFromZero = me.VarInit(aData, "display.linkFromZero", false);
        l.display.linkType = me.VarInit(aData, "display.linkType", "linkData");
        l.display.dataType = me.VarInit(aData, "display.dataType", "rectangle");
        l.display.dataWidth = me.VarInit(aData, "display.dataWidth", 4);
        l.display.dataColor = me.VarInit(aData, "display.dataColor", "#000");
        me.dataLst.push(l);
        me.LimitInit();
        return 1;
    }

    // supprime des donnÃ©es
    me.DataDelete = function (aTitle) {
        for (i = 0; i < me.dataLst.length; i++) {
            if (me.dataLst[i].title == aTitle) {
                me.dataLst.splice(i, 1);
                return 1;
            }
        }
        return 0;
    }

    // calcule les points d'ancrage d'une courbe bezier Ã  partir de 3 points x, y
    // https://stackoverflow.com/questions/7054272
    me.BezierCalc = function (preP, curP, nexP) {
        var f = 0.3, t = 0.6, x = 0, y = 0;
        if (nexP) {
            m = (nexP[1] - preP[1]) / (nexP[0] - preP[0]);
            x = (nexP[0] - curP[0]) * - f;
            y = x * m * t;
        }
        return [x, y];
    }

    // calcul les valeurs auto
    me.LimitInit = function (aData) {
        if (me.axe.x.minAuto || me.axe.x.maxAuto || me.axe.y.minAuto || me.axe.y.maxAuto) {
            var xMin, xMax, yMin, yMax, i, j;
            for (i = 0; i < me.dataLst.length; i++) {
                if (me.dataLst[i].limit.x.min < xMin || xMin === undefined) xMin = me.dataLst[i].limit.x.min;
                if (me.dataLst[i].limit.x.max > xMax || xMax === undefined) xMax = me.dataLst[i].limit.x.max;
                if (me.dataLst[i].limit.y.min < yMin || yMin === undefined) yMin = me.dataLst[i].limit.y.min;
                if (me.dataLst[i].limit.y.max > yMax || yMax === undefined) yMax = me.dataLst[i].limit.y.max;
            }
            if (me.axe.x.minAuto) me.axe.x.min = xMin;
            if (me.axe.x.maxAuto) me.axe.x.max = xMax;
            if (me.axe.y.minAuto) me.axe.y.min = yMin;
            if (me.axe.y.maxAuto) me.axe.y.max = yMax;
        }
        if (me.axe.x.stepAuto) me.axe.x.step = (me.axe.x.max - me.axe.x.min) / (me.axe.x.list ? me.axe.x.list.length : 10);
        if (me.axe.y.stepAuto) me.axe.y.step = (me.axe.y.max - me.axe.y.min) / (me.axe.y.list ? me.axe.y.list.length : 10);
    }

    // renvoi une variable si elle existe, ou une valeur par dÃ©faut
    me.VarInit = function (aObj, aPropLst, aDefault) {
        var v = aPropLst.split('.').reduce(function (a, b) {
            return a ? a[b] : undefined;
        }, aObj);
        return v === undefined ? aDefault : v;
    }

    // donnÃ©es
    me.dataLst = [];

    // marges
    me.margin = {};
    me.margin.top = me.VarInit(aData, "margin.top", 5);
    me.margin.right = me.VarInit(aData, "margin.right", 5);
    me.margin.bottom = me.VarInit(aData, "margin.bottom", 5);
    me.margin.left = me.VarInit(aData, "margin.left", 5);

    // axes
    me.axe = {};
    me.axe.arrow = me.VarInit(aData, "axe.arrow", true);
    me.axe.width = me.VarInit(aData, "axe.thickness", 2);
    me.axe.color = me.VarInit(aData, "axe.color", "#000");
    me.axe.x = {};
    me.axe.x.title = me.VarInit(aData, "axe.x.title", "");
    me.axe.x.list = me.VarInit(aData, "axe.x.list", "");
    me.axe.x.min = me.VarInit(aData, "axe.x.min", "auto");
    me.axe.x.max = me.VarInit(aData, "axe.x.max", "auto");
    me.axe.x.step = me.VarInit(aData, "axe.x.step", "auto");
    me.axe.x.minAuto = (me.axe.x.min == "auto");
    me.axe.x.maxAuto = (me.axe.x.max == "auto");
    me.axe.x.stepAuto = (me.axe.x.step == "auto");
    me.axe.x.textDisplayEvery = me.VarInit(aData, "axe.x.textDisplayEvery", 1);
    me.axe.x.textSize = me.VarInit(aData, "axe.x.textSize", 12);
    me.axe.x.textColor = me.VarInit(aData, "axe.x.textColor", "#000");
    me.axe.y = {};
    me.axe.y.title = me.VarInit(aData, "axe.y.title", "");
    me.axe.y.list = me.VarInit(aData, "axe.y.list", "");
    me.axe.y.min = me.VarInit(aData, "axe.y.min", "auto");
    me.axe.y.max = me.VarInit(aData, "axe.y.max", "auto");
    me.axe.y.step = me.VarInit(aData, "axe.y.step", "auto");
    me.axe.y.minAuto = me.axe.y.min === "auto" ? true : false;
    me.axe.y.maxAuto = me.axe.y.max === "auto" ? true : false;
    me.axe.y.stepAuto = me.axe.y.step === "auto" ? true : false;
    me.axe.y.textDisplayEvery = me.VarInit(aData, "axe.y.textDisplayEvery", 1);
    me.axe.y.textSize = me.VarInit(aData, "axe.y.textSize", 12);
    me.axe.y.textColor = me.VarInit(aData, "axe.y.textColor", "#000");

    // grille
    me.grid = {};
    me.grid.x = {};
    me.grid.x.width = me.VarInit(aData, "grid.x.thickness", 1);
    me.grid.x.color = me.VarInit(aData, "grid.x.color", "#f0f0f0");
    me.grid.y = {};
    me.grid.y.width = me.VarInit(aData, "grid.y.thickness", 1);
    me.grid.y.color = me.VarInit(aData, "grid.y.color", "#f0f0f0");

    // retourne l'objet
    return me;
}



/** TEST */



var graph = new jsGraphDisplay({
    margin: {
        top: 25,
        right: 30,
        bottom: 25,
        left: 25
    }
});

var display = {
    linkType: "bezier",
    linkWidth: "1",
    linkColor: "#FF0000",
    linkFromZero: "false",
    linkDash: [],
    dataType: "rectangle",
    dataWidth: "4",
    dataColor: "#000"
}

graph.DataAdd({
    data: [
        [moment().subtract(130, 'days'), 21],
        [moment().subtract(114, 'days'), 23],
        [moment().subtract(94, 'days'), 26],
        [moment().subtract(80, 'days'), 25],
        [moment().subtract(64, 'days'), 20],
        [moment().subtract(54, 'days'), 22],
        [moment().subtract(30, 'days'), 27],
        [moment(), 35]
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
        [moment(), 27]
    ],
    display
});



graph.Draw('canvas');

