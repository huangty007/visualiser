//drawing cycle notation
function drawCycles(cycleId, arr_cycle, n) {
    var classType = "";
    var zoomOutID = "";
    var classId = "";
    if (cycleId == "#facesCycleGraph") {
        color = "#A04000";
        classType = "FC";
        zoomOutID = "zoomOutFC";
        classId = "FCSVG";
    }
    else if (cycleId == "#edgesCycleGraph") {
        color = "#145A32";
        classType = "EC";
        zoomOutID = "zoomOutEC";
        classId = "ECSVG";
    }
    else if (cycleId == "#verticesCycleGraph") {
        color = "#21618C";
        classType = "VC";
        zoomOutID = "zoomOutVC";
        classId = "VCSVG";
    }

    zoomID = "zoom." + classId;
    var x, y, s;
    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scaleExtent([1, 10])
        .scale(1);

    //load the canvas/svg
    var svg = d3.select(cycleId).append("svg:svg");
    w = 1100, h = 90;
    svg.attr("width", w).attr("height", h).attr("class", classId).call(zoom.on(zoomID, zoomed));
    distance_x = w / n;
    distance_y = h / 2;

    container = svg.append("svg:g");

    function zoomed() {
        // console.log("event", this);
        x = d3.event.translate[0];
        y = d3.event.translate[1];
        s = d3.event.scale;
        elem = d3.select(this).select("g");
        elem.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    };

    //generating nodes and links
    nodes = new Array(n).fill(0).map(function (v, i) { return { x: ((2 * i + 1) / 2) * distance_x, y: distance_y } });
    links = new Array();
    for (var i in arr_cycle) {
        for (var j in arr_cycle[i]) {
            if (j == arr_cycle[i].length - 1) {
                links.push({ source: nodes[arr_cycle[i][j]], target: nodes[arr_cycle[i][0]] });
            }
            else {
                links.push({ source: nodes[arr_cycle[i][j]], target: nodes[arr_cycle[i][parseInt(j) + 1]] });
            }
        }
    }

    //Draw nodes
    // var dataset = new Array(n).fill(0).map((v, i) => { return v + i; })
    var circles = container.selectAll("circle .nodes")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", classType)
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })

    circles.append("circle")
        .attr("r", distance_x / 4 > 8 ? 8 : distance_x / 4)
        .attr("fill", color);
    // .attr("stroke", "black")
    // .attr("stroke-width", function (d) { return 2; });

    circles.append("text")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-size", distance_x / 4 > 8 ? 8 : distance_x / 4)
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text(function (d, i) { return i; });

    //Draw links
    //Draw arrow
    var cyclePath = container.selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .style("fill", "none")
        .style("stroke", color)
        .style("stroke-width", distance_x / 10 > 2 ? 2 : distance_x / 10)

    var defs = svg.append("defs");
    var arrows = defs.append("marker")
        .attr("id", "arrow" + cycleId)
        .attr("markerWidth", 12)
        .attr("markerHeight", 12)
        .attr("markerUnits", "strokeWidth")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", color)
        .attr("d", "M2,4 L6,6 L2,8 L4,6 L2,4");


    dis = distance_x / 4 > 10 ? 10 : distance_x / 4;

    cyclePath.attr("d", function (d) { return Curve(d.source, d.target, dis) })
        .attr("marker-end", "url(#arrow" + cycleId + ")");

    var btnid = "#" + zoomOutID;
    var btnns = 'click.' + zoomOutID;
    d3.select(btnid).on(btnns, function () {
        var doc = this.getAttribute("for");
        var contextid = "#" + doc;
        var ownersvg = d3.select(contextid).select("svg");
        d3.transition().duration(250).tween("zoom", function () {
            var si = d3.interpolate(s, 1);
            var xi = d3.interpolate(x, 0);
            var yi = d3.interpolate(y, 0);
            return function (t) {
                ownersvg.call(zoom.translate([xi(t), yi(t)]).scale(si(t)).event);
            }
        });
    });

    var clid = '.' + classType;
    var clns = 'click.' + classType;
    d3.selectAll(clid).on(clns, function () {
        var gelem = d3.select(this);
        gelem.transition().duration(250).tween("zoom", function () {
            var pelem = this.ownerSVGElement;
            var h = pelem.getAttribute("height");
            var circle = this.children[0];
            var r = circle.getAttribute('r') * 1;
            var d = this.getAttribute('transform');
            elem = d.match(/[-+]?[0-9]*\.?[0-9]+/g).map(Number);
            var cx = elem[0] * 1;
            if (r < 8 && r > 4) {
                var si = d3.interpolate(s, 4);
                var yi = d3.interpolate(y, -1.5 * h);
                var xi = d3.interpolate(x, -3 * cx);
            }
            else if (r <= 4) {
                var si = d3.interpolate(s, 8);
                var yi = d3.interpolate(y, -7 * h / 2);
                var xi = d3.interpolate(x, -7 * cx);
            }
            else {
                var si = d3.interpolate(s, 1.5);
                var yi = d3.interpolate(y, -h / 4);
                var xi = d3.interpolate(x, -cx / 2);
            }
            return function (t) {
                st = si(t);
                yt = yi(t);
                xt = xi(t);
                ownersvg = d3.select(this.ownerSVGElement);
                ownersvg.call(zoom.translate([xt, yt]).scale(st).event);
            }
        });
    });

    var cdir = "." + classId;
    var basesvg = d3.select(cdir);
    basesvg.call(zoom.event);
}

//generating curve for cycles
function Curve(source, target, dis) {
    m = dis;
    x1 = source.x;
    x2 = target.x;
    y1 = source.y;
    y2 = target.y;
    if (x1 > x2) {
        x1 -= m;
        y1 += m;
        x2 += m;
        y2 += m;
        curve = Math.random() * 0.5 + 0.6;
    }
    else if (x1 == x2) {

        path = "M" + (x1 + m) + "," + (y1 - m) + " A" + dis + "," + dis + " 0 1,1 " + (x1 + m) + "," + (y1 + m);
        // console.log(path);
        return path;
    }
    else {
        x1 += m;
        y1 -= m;
        x2 -= m;
        y2 -= m;
        curve = Math.random() - 1.6;
    }

    k2 = -(x2 - x1) / (y2 - y1);
    if (k2 < 2 && k2 > -2) {
        controlX = (x2 + x1) / 2 + curve * 30;
        controlX = controlX < 0 ? -controlX : controlX;
        controlY = k2 * (controlX - (x1 + x2) / 2) + (y1 + y2) / 2;
        controlY = controlY < 0 ? -controlY : controlY;
    } else {
        controlY = (y2 + y1) / 2 + curve * 30;
        controlY = controlY < 0 ? -controlY : controlY;
        controlX = k2 ? (controlY - (y1 + y2) / 2) / k2 + (x1 + x2) / 2 : (x1 + x2) / 2;
        controlX = controlX < 0 ? -controlX : controlX;
    }
    path = "M" + x1 + "," + y1 + " Q" + Math.floor(controlX) + "," + Math.floor(controlY) + "," + x2 + "," + y2;
    // console.log(path);
    return path;
}

//drawing on-line notation
function drawPermutation(permId, arr_p, n) {
    var classType = "";
    var zoomOutID = "";
    var classId = "";
    if (permId == "#facesPermutationsGraph") {
        color = "#A04000";
        classType = "FP";
        zoomOutID = "zoomOutFP";
        classId = "FPSVG";
    }
    else if (permId == "#edgesPermutationsGraph") {
        color = "#145A32";
        classType = "EP";
        zoomOutID = "zoomOutEP";
        classId = "EPSVG";
    }
    else if (permId == "#verticesPermutationsGraph") {
        color = "#21618C";
        classType = "VP";
        zoomOutID = "zoomOutVP";
        classId = "VPSVG";
    }

    zoomID = "zoom." + classId;
    var x, y, s;
    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scaleExtent([1, 10])
        .scale(1);
    //load the canvas/svg
    var svg = d3.select(permId).append("svg");
    w = 1100, h = 90;
    svg.attr("width", w).attr("height", h).attr("class", classId).call(zoom.on(zoomID, zoomed));
    distance_x = w / n;
    distance_y = h / 6;

    container = svg.append("svg:g");

    function zoomed() {
        // console.log("event", this);
        x = d3.event.translate[0];
        y = d3.event.translate[1];
        s = d3.event.scale;
        elem = d3.select(this).select("g");
        elem.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    };
    //generating nodes and links
    nodes = new Array(2 * n).fill(0).map(function (v, i) {
        return i < n ? { x: ((2 * i + 1) / 2) * distance_x, y: distance_y } : { x: ((2 * (i - n) + 1) / 2) * distance_x, y: distance_y * 5 }
    });

    links = new Array();
    for (var i in arr_p) {
        links.push({ source: nodes[parseInt(i)], target: nodes[arr_p[i] + n] });
    }

    //Draw nodes
    // var dataset = new Array(n).fill(0).map((v, i) => { return v + i; })
    var circles = container.selectAll("circle .nodes")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", classType)
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })

    circles.append("circle")
        .attr("r", distance_x / 4 > 8 ? 8 : distance_x / 4)
        .attr("fill", color);
    // .attr("stroke", "black")
    // .attr("stroke-width", function (d) { return 2; });

    circles.append("text")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-size", distance_x / 4 > 8 ? 8 : distance_x / 4)
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .text(function (d, i) { return i < n ? i : i - n; });

    //Draw links
    //Draw arrow
    var permPath = container.selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .style("fill", "none")
        .style("stroke", color)
        .style("stroke-width", distance_x / 10 > 2 ? 2 : distance_x / 10)

    var defs = svg.append("defs");
    var arrows = defs.append("marker")
        .attr("id", "arrow" + permId)
        .attr("markerWidth", 14)
        .attr("markerHeight", 14)
        .attr("markerUnits", "strokeWidth")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", color)
        .attr("d", "M2,4 L6,6 L2,8 L4,6 L2,4");

    m = distance_x / 4 > 8 ? 8 : distance_x / 4;
    permPath.attr("d", function (d) {
        x1 = d.source.x;
        y1 = d.source.y;
        x2 = d.target.x;
        y2 = d.target.y;
        if (x1 < x2) {
            x1 += m;
            x2 -= m;
            y1 += m;
            y2 -= m;
        }
        else if (x1 == x2) {
            y1 += m;
            y2 -= m
        }
        else {
            x1 -= m;
            x2 += m;
            y1 += m;
            y2 -= m;
        }
        return "M" + x1 + "," + y1 + " L" + x2 + "," + y2;
    })
        .attr("marker-end", "url(#arrow" + permId + ")");

    var btnid = "#" + zoomOutID;
    var btnns = 'click.' + zoomOutID;
    d3.select(btnid).on(btnns, function () {
        var doc = this.getAttribute("for");
        var contextid = "#" + doc;
        var ownersvg = d3.select(contextid).select("svg");
        d3.transition().duration(250).tween("zoom", function () {
            var si = d3.interpolate(s, 1);
            var xi = d3.interpolate(x, 0);
            var yi = d3.interpolate(y, 0);
            return function (t) {
                ownersvg.call(zoom.translate([xi(t), yi(t)]).scale(si(t)).event);
            }
        });
    });

    var clid = '.' + classType;
    var clns = 'click.' + classType;
    d3.selectAll(clid).on(clns, function () {
        var gelem = d3.select(this);
        gelem.transition().duration(250).tween("zoom", function () {
            var circle = this.children[0];
            var r = circle.getAttribute('r') * 1;
            var d = this.getAttribute('transform');
            elem = d.match(/[-+]?[0-9]*\.?[0-9]+/g).map(Number);
            var cx = elem[0] * 1;
            var cy = elem[1] * 1;
            if (r < 8 && r > 4) {
                var si = d3.interpolate(s, 4);
                var yi = d3.interpolate(y, -3 * cy);
                var xi = d3.interpolate(x, -3 * cx);
            }
            else if (r <= 4) {
                var si = d3.interpolate(s, 8);
                var yi = d3.interpolate(y, -7 * cy);
                var xi = d3.interpolate(x, -7 * cx);
            }
            else {
                var si = d3.interpolate(s, 1.5);
                var yi = d3.interpolate(y, -cy / 2);
                var xi = d3.interpolate(x, -cx / 2);
            }
            return function (t) {
                st = si(t);
                yt = yi(t);
                xt = xi(t);
                ownersvg = d3.select(this.ownerSVGElement);
                ownersvg.call(zoom.translate([xt, yt]).scale(st).event);
            }
        });
    });

    var cdir = "." + classId;
    var basesvg = d3.select(cdir);
    basesvg.call(zoom.event);
}

//drawing  tree method
function drawTree(arr_tree, arr_path, vc, ec, id, width = 350, height = 350) {
    var start = new Date().getMilliseconds();
    n = vc.length;
    if (n == 1) {
        children_tree = [null];
    }
    else {
        children_tree = new Array(n).fill(null)
        for (var i in children_tree) {
            children = new Array();
            for (var j in arr_tree) {
                if (arr_tree[j][0] == parseInt(i)) {
                    children.push(arr_tree[j][1]);
                }
            }
            if (children.length > 0) {
                children_tree[i] = children;
            }
        }
    }
    // console.log(children_tree);
    b_tree = genBasicTree(children_tree);
    max_depth = b_tree[2];
    h = (height - 20) / (max_depth + 1);
    console.log("max_depth:", max_depth);
    // console.log(b_tree);
    // console.log("max_depth:",b_tree[2]);
    // console.log("h:",h);
    tree = new Tree(b_tree);//generate the tree constructure
    wide = getWide(tree, new Array(max_depth + 1).fill(0));
    wide = wide.sort((a, b) => { return a - b; });
    max_wide = 0;
    max_length = wide.length;
    for (i in wide) {
        divide = (parseInt(i)+1) / max_length;
        max_wide += divide * wide[i];
    }
    w = width / Math.ceil(max_wide);
    // console.log("wtree:" + max_wide);
    setPrimCoordination(tree, w);
    range = setTargetCoordination(tree, h);
    midoffset = width / 2 - tree.x;

    if (range[0] < 0) {
        setFinalCoordination(tree, -range[0]);
    }
    else if (midoffset > 0 && range[1] + midoffset < width) {
        setFinalCoordination(tree, midoffset);
    }

    //Draw tree
    a = new Array(n);
    nodes = genTreeNodes(tree, vc, a);
    links = genTreeLinks(nodes, arr_path, arr_tree, vc, ec, h);

    svg = drawTreeSVG(nodes, links, width, height, h, id);
    var end = new Date().getMilliseconds();
    console.log("m1:",end-start);
    return svg;
}

//generating Tree nodes
function genTreeNodes(tree, vc, nodes = []) {
    var id = tree.t;
    var darts = vc[id];
    nodes[tree.t] = { x: tree.x, y: tree.y, id: tree.t, darts: darts };
    if (tree.children) {
        for (c in tree.children) {
            nodes = genTreeNodes(tree.children[c], vc, nodes);
        }
        return nodes;
    }
}

//generating Tree links
function genTreeLinks(nodes, arr_path, arr_tree, vc, ec, h) {
    offset = h / 4 > 10 ? 10 : h / 4;
    vertices_length = vc.length;
    //for one vertex
    if (vertices_length == 1) {
        links = new Array();
        darts = vc[0];
        darts_num = darts.length;
        rad = 2 * Math.PI / darts_num;
        r_x = nodes[0].x;
        r_y = nodes[0].y;
        darts_cor = new Array(darts_num).fill(null);
        for (i in darts) {
            angle = rad * i;
            x = r_x - offset * Math.sin(angle);
            y = r_y + offset * Math.cos(angle);
            darts_cor[i] = { x: x, y: y };;
        }
        for (j in ec) {
            d1 = ec[j][0];
            c1 = darts_cor[d1];
            d2 = ec[j][1];
            c2 = darts_cor[d2];
            links.push({ i: "curve", type: "loop", source: nodes[0], target: nodes[0], c1: c1, c2: c2, id: 0 + "," + 0, start: d1, end: d2 });
        }
        return links;
    }
    else {
        perm_n = ec.length * 2;
        edges_info = new Array(perm_n).fill(0).map((v, i) => { return { ver: null, idx: null, cor: { x: null, y: null } } });
        res_ec = new Array();
        for (i in ec) {
            exist = false;
            for (j in arr_path) {
                if (ec[i].indexOf(arr_path[j][0]) > -1 && ec[i].indexOf(arr_path[j][1]) > -1) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                res_ec.push(ec[i]);
            }
        }
        // console.log(res_ec);
        for (i in vc) {
            for (j in vc[i]) {
                edges_info[vc[i][j]].ver = parseInt(i);
                edges_info[vc[i][j]].idx = parseInt(j);
            }
        }
        cal_vertice = new Array(vertices_length).fill(0).map((v, i) => { return [] });
        //set the tree darts
        links = new Array();
        for (l in arr_tree) {
            for (n in nodes) {
                if (nodes[n].id == arr_tree[l][0]) {
                    source = { x: nodes[n].x, y: nodes[n].y, id: arr_path[l][0] };
                }
                else if (nodes[n].id == arr_tree[l][1]) {
                    target = { x: nodes[n].x, y: nodes[n].y, id: arr_path[l][1] };
                }
            }
            mol = Math.sqrt(Math.pow((target.x - source.x), 2) + Math.pow((target.y - source.y), 2));
            dir_x = target.x - source.x;
            dir_y = target.y - source.y;
            edges_info[arr_path[l][0]].cor = { x: source.x + dir_x / mol * 3 * offset, y: source.y + dir_y / mol * 3 * offset };
            edges_info[arr_path[l][1]].cor = { x: target.x - dir_x / mol * 3 * offset, y: target.y - dir_y / mol * 3 * offset };
            c1 = edges_info[arr_path[l][0]].cor;
            c2 = edges_info[arr_path[l][1]].cor;
            source.x = source.x + dir_x / mol * offset;
            source.y = source.y + dir_y / mol * offset;
            target.x = target.x - dir_x / mol * offset;
            target.y = target.y - dir_y / mol * offset;
            idx_s = parseInt(edges_info[arr_path[l][0]].idx);
            ver_s = parseInt(edges_info[arr_path[l][0]].ver);
            cal_vertice[ver_s].push(idx_s);
            cal_vertice[ver_s].sort((a, b) => { return a - b; });
            idx = parseInt(edges_info[arr_path[l][1]].idx);
            ver = parseInt(edges_info[arr_path[l][1]].ver);
            cal_vertice[ver].push(idx);
            cal_vertice[ver].sort((a, b) => { return a - b; });
            angle = Math.PI / 3;
            links.push({ i: "straight", source: source, target: target, id: ver_s + "," + ver, start: arr_path[l][0], end: arr_path[l][1] })
        }
        // console.log("2", edges_info);
        //set the rest darts
        flag = true;
        if (!flag) {
            // for (v in vc) {
            //     for (j in vc[v]) {
            //         idx = parseInt(j);
            //         if (cal_vertice[v].indexOf(idx) == -1) {
            //             cal_vertice[v].push(idx);
            //             cal_vertice[v].sort((a, b) => { return a - b; });
            //             len = cal_vertice[v].length;
            //             len_o = vc[v].length;
            //             cal_idx = cal_vertice[v].indexOf(idx);
            //             o_x = nodes[v].x;
            //             o_y = nodes[v].y;
            //             //no left(left is the last element) clockwise
            //             if (cal_idx == 0) {
            //                 right = parseInt(cal_vertice[v][1]);
            //                 left = parseInt(cal_vertice[v][len - 1]);
            //                 r_x = edges_info[vc[v][right]].cor.x;
            //                 r_y = edges_info[vc[v][right]].cor.y;
            //                 if (right == left) {
            //                     angle = (right - idx) / len_o * Math.PI * 2;
            //                 }
            //                 else {
            //                     l_x = edges_info[vc[v][left]].cor.x;
            //                     l_y = edges_info[vc[v][left]].cor.y;
            //                     vl = { x: l_x - o_x, y: l_y - o_y };
            //                     vr = { x: r_x - o_x, y: r_y - o_y };
            //                     rad = 2 * Math.PI - cal_angle(vl, vr);// angle between left and right
            //                     angle = (right - idx) / (len_o - left + right) * rad;
            //                 }
            //                 edges_info[vc[v][idx]].cor.x = (r_x - o_x) * Math.cos(angle) + (r_y - o_y) * Math.sin(angle) + o_x
            //                 edges_info[vc[v][idx]].cor.y = -(r_x - o_x) * Math.sin(angle) + (r_y - o_y) * Math.cos(angle) + o_y
            //             }
            //             //no right(right is the first element) anticlockwise
            //             else if (cal_idx == len - 1) {
            //                 right = cal_vertice[v][0];
            //                 left = cal_vertice[v][cal_idx - 1];
            //                 l_x = edges_info[vc[v][left]].cor.x;
            //                 l_y = edges_info[vc[v][left]].cor.y;
            //                 if (right == left) {
            //                     angle = (idx - left) / len_o * Math.PI * 2;
            //                 }
            //                 else {
            //                     r_x = edges_info[vc[v][right]].cor.x;
            //                     r_y = edges_info[vc[v][right]].cor.y;
            //                     vl = { x: l_x - o_x, y: l_y - o_y };
            //                     vr = { x: r_x - o_x, y: r_y - o_y };
            //                     rad = 2 * Math.PI - cal_angle(vl, vr);// angle between left and right
            //                     angle = (idx - left) / (len_o - left + right) * rad;
            //                 }
            //                 edges_info[vc[v][idx]].cor.x = (l_x - o_x) * Math.cos(angle) - (l_y - o_y) * Math.sin(angle) + o_x
            //                 edges_info[vc[v][idx]].cor.y = (l_x - o_x) * Math.sin(angle) + (l_y - o_y) * Math.cos(angle) + o_y
            //             }
            //             else {
            //                 right = cal_vertice[v][cal_idx + 1];
            //                 left = cal_vertice[v][cal_idx - 1];
            //                 l_x = edges_info[vc[v][left]].cor.x;
            //                 l_y = edges_info[vc[v][left]].cor.y;
            //                 r_x = edges_info[vc[v][right]].cor.x;
            //                 r_y = edges_info[vc[v][right]].cor.y;
            //                 vl = { x: l_x - o_x, y: l_y - o_y };
            //                 vr = { x: r_x - o_x, y: r_y - o_y };
            //                 rad = cal_angle(vr, vl);//angle between right and left
            //                 angle = (idx - left) / (right - left) * rad;
            //                 edges_info[vc[v][idx]].cor.x = (l_x - o_x) * Math.cos(angle) - (l_y - o_y) * Math.sin(angle) + o_x;
            //                 edges_info[vc[v][idx]].cor.y = (l_x - o_x) * Math.sin(angle) + (l_y - o_y) * Math.cos(angle) + o_y;
            //             }
            //         }
            //     }
            // }
        }
        else {
            for (let v = 0; v < vertices_length; v++) {
                vertex = vc[v];
                whole_length = vertex.length;
                straight_vertex_idx = cal_vertice[v];
                straight_length = straight_vertex_idx.length;
                if (straight_length < whole_length) {
                    org = { x: nodes[v].x, y: nodes[v].y };
                    //for only one tree path for the current vertex
                    if (straight_length == 1) {
                        straight_idx = straight_vertex_idx[0];
                        straight_dart = vertex[straight_idx];
                        s = { x: edges_info[straight_dart].cor.x, y: edges_info[straight_dart].cor.y };
                        before = vertex.slice(0, straight_idx);
                        vertex_p = vertex.slice(straight_idx + 1);
                        vertex_p = vertex_p.concat(before);
                        current_lenght = vertex_p.length;
                        rad = 2 * Math.PI / whole_length;
                        for (let cidx = 1; cidx <= current_lenght; cidx++) {
                            angle = rad * cidx;
                            dart = vertex_p[cidx - 1];
                            edges_info[dart].cor.x = (s.x - org.x) * Math.cos(angle) + (s.y - org.y) * Math.sin(angle) + org.x;
                            edges_info[dart].cor.y = -(s.x - org.x) * Math.sin(angle) + (s.y - org.y) * Math.cos(angle) + org.y;
                        }
                    }
                    else if (straight_length > 1) {
                        first_idx = straight_vertex_idx[0];
                        last_idx = straight_vertex_idx[straight_length - 1];
                        if (first_idx > 0 || last_idx < whole_length - 1) {
                            start = vertex[last_idx];
                            end = vertex[first_idx];
                            before = vertex.slice(0, first_idx);
                            vertex_p = vertex.slice(last_idx + 1);
                            vertex_p = vertex_p.concat(before);
                            p_lenght = vertex_p.length;
                            s = { x: edges_info[start].cor.x, y: edges_info[start].cor.y };
                            e = { x: edges_info[end].cor.x, y: edges_info[end].cor.y };
                            v_s = { x: s.x - org.x, y: s.y - org.y };
                            v_e = { x: e.x - org.x, y: e.y - org.y };
                            i_angle = cal_angle(v_s, v_e);
                            rad = i_angle / (p_lenght + 1);
                            for (let cidx = 1; cidx <= p_lenght; cidx++) {
                                angle = rad * cidx;
                                dart = vertex_p[cidx - 1];
                                edges_info[dart].cor.x = (s.x - org.x) * Math.cos(angle) + (s.y - org.y) * Math.sin(angle) + org.x;
                                edges_info[dart].cor.y = -(s.x - org.x) * Math.sin(angle) + (s.y - org.y) * Math.cos(angle) + org.y;
                            }
                        }
                        for (let sidx = 1; sidx <= straight_length; sidx++) {
                            first_idx = straight_vertex_idx[sidx - 1];
                            last_idx = straight_vertex_idx[sidx];
                            if (last_idx - first_idx > 1) {
                                start = vertex[first_idx];
                                end = vertex[last_idx];
                                vertex_p = vertex.slice(first_idx + 1, last_idx);
                                p_lenght = vertex_p.length;
                                s = { x: edges_info[start].cor.x, y: edges_info[start].cor.y };
                                e = { x: edges_info[end].cor.x, y: edges_info[end].cor.y };
                                v_s = { x: s.x - org.x, y: s.y - org.y };
                                v_e = { x: e.x - org.x, y: e.y - org.y };
                                i_angle = cal_angle(v_s, v_e);
                                rad = i_angle / (p_lenght + 1);
                                for (let cidx = 1; cidx <= p_lenght; cidx++) {
                                    angle = rad * cidx;
                                    dart = vertex_p[cidx - 1]
                                    edges_info[dart].cor.x = (s.x - org.x) * Math.cos(angle) + (s.y - org.y) * Math.sin(angle) + org.x;
                                    edges_info[dart].cor.y = -(s.x - org.x) * Math.sin(angle) + (s.y - org.y) * Math.cos(angle) + org.y;
                                }
                            }
                        }
                    }
                }
            }
        }

        for (re in res_ec) {
            d1 = res_ec[re][0];
            d2 = res_ec[re][1];
            path = 0;
            source = edges_info[d1].ver;
            target = edges_info[d2].ver;
            c1 = { x: edges_info[d1].cor.x, y: edges_info[d1].cor.y }
            c2 = { x: edges_info[d2].cor.x, y: edges_info[d2].cor.y }
            s = { x: nodes[source].x + (c1.x - nodes[source].x) / 4, y: nodes[source].y + (c1.y - nodes[source].y) / 4 };
            if (source == target) {
                t = { x: nodes[source].x + (c2.x - nodes[source].x) / 4, y: nodes[source].y + (c2.y - nodes[source].y) / 4 };
                links.push({ i: "curve", type: "loop", source: s, target: t, c1: c1, c2: c2, id: source + "," + target, start: d1, end: d2 })
                // links.push({ i: "curve", type: "loop", source: s,c1: c1, id: source + "," + target, start: d1, end: d2 });
                // links.push({ i: "curve", type: "loop", source: t, c1: c2, id: source + "," + target, start: d1, end: d2 });
            }
            else {
                t = { x: nodes[target].x + (c2.x - nodes[target].x) / 4, y: nodes[target].y + (c2.y - nodes[target].y) / 4 };
                links.push({ i: "curve", type: "normal", source: s, target: t, c1: c1, c2: c2, id: source + "," + target, start: d1, end: d2 })
            }
        }
    }
    return links;
}

function cal_angle(v1, v2) {
    angle = Math.atan2(v1.y, v1.x) - Math.atan2(v2.y, v2.x);
    if (angle < 0) {
        angle = angle + 2 * Math.PI;
    }
    return angle
}

function drawTreeSVG(nodes, links, width, height, h, id) {
    var x, y, s;
    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scaleExtent([1, 10])
        .scale(1)
        .on("zoom.tree", () => {
            // console.log("event", d3.event);
            x = d3.event.translate[0];
            y = d3.event.translate[1];
            s = d3.event.scale;
            container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });

    var tooltip = d3.select(id)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0.0);

    var svg = d3.select(id).append("svg:svg");
    svg.attr("width", width)
        .attr("height", height)
        // .style("pointer-events","all")
        .call(zoom);

    var container = svg.append("g");

    var circles = container.selectAll("circle")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

    circles.append("circle")
        .attr("r", h / 4 > 10 ? 10 : h / 4)
        .attr("fill", "#17202A");

    circles.append("text")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-size", "0.7em")
        .attr("font-weight", "bold")
        .attr("fill", "#F7F9F9");

    circles.on("mouseover", function (d) {
        d3.select(this).select("circle").attr("fill", "#F1C40F");
        tooltip.html("(" + d.darts + ")")
            .style("left", (d3.event.offsetX + 25) + "px")
            .style("top", (d3.event.offsetY + 68) + "px")
            .style("opacity", 1.0);
    })
        .on("mouseout", function (d) {
            d3.select(this).select("circle").attr("fill", "#17202A");
            tooltip.style("opacity", 0.0);
        })

    var Path = container.selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", function (d) {
            if (d.i == "straight") { return "#CD5C5C"; }
            else { return "#17202A"; }
        })
        .attr("stroke-width", function (d) {
            if (d.i == "straight") { return h / 4 > 10 ? 8 : h / 6; }
            else { return h / 4 > 10 ? 4 : h / 16 }
            ;
        })

    // var defs = svg.append("defs");
    // var midPoint = defs.append("marker")
    //     .attr("id", "midPoint")
    //     .attr("markerWidth", 6)
    //     .attr("markerHeight", 6)
    //     .attr("markerUnits", "strokeWidth")
    //     .attr("viewBox", "0 0 6 6")
    //     .attr("refX", 3)
    //     .attr("refY", 3)
    //     .attr("orient", "auto")
    //     .append("circle")
    //     .attr("cx", 3)
    //     .attr("cy", 3)
    //     .attr("r", 1)
    //     .attr("fill", "white")

    Path.attr("id", function (d) { return d.id; })
        .attr("d", function (d) {
            if (d.i == "straight") { return "M" + d.source.x + "," + d.source.y + " L" + (d.target.x + d.source.x) / 2 + "," + (d.target.y + d.source.y) / 2 + " L" + d.target.x + "," + d.target.y; }
            // "M" + d.source.x + "," + (d.source.y + 10) + " L" + (d.target.x + d.source.x) / 2 + "," + (d.target.y + d.source.y) / 2 + " L" + d.target.x + "," + (d.target.y - 10);
            else if (d.type == "loop") {
                return "M" + d.source.x + "," + d.source.y + " L" + d.c1.x + "," + d.c1.y + "  A" + h / 6 + "," + h / 6 + " 0 1,0 " + d.c2.x + "," + d.c2.y + " L" + d.target.x + "," + d.target.y;
                // return "M" + d.source.x + "," + d.source.y + " L" + d.c1.x + "," + d.c1.y;

            }
            else {
                return "M" + d.source.x + "," + d.source.y + " C" + d.c1.x + "," + d.c1.y + " " + d.c2.x + "," + d.c2.y + " " + d.target.x + "," + d.target.y;
            }
        })
        .on("mouseover", function (d) {
            var swidth = this.getAttribute("stroke-width");
            d3.select(this).attr("stroke", function (d) {
                if (d.i == "straight") { return "#CD5C5C"; }
                else { return "#F1C40F"; }
            }).attr("stroke-width", function (d) {
                if (d.i == "straight") { return swidth; }
                else { return swidth; }
            });
            tooltip.html("(" + d.start + "," + d.end + ")")
                .style("left", (d3.event.offsetX + 25) + "px")
                .style("top", (d3.event.offsetY + 68) + "px")
                .style("opacity", 1.0);
        })
        .on("mouseout", function (d) {
            var swidth = this.getAttribute("stroke-width");
            d3.select(this).attr("stroke", function (d) {
                if (d.i == "straight") { return "#CD5C5C"; }
                else { return "#17202A"; }
            }).attr("stroke-width", function (d) {
                if (d.i == "straight") { return swidth; }
                else { return swidth; }
            });
            tooltip.style("opacity", 0.0);
        })
    // var pathText = svg.selectAll(".pathText")
    //     .data(links)
    //     .enter()
    //     .append("text")
    //     .attr("rotate", "270")
    //     .attr("stroke", "#626567")
    //     .attr("stroke-width", 2);
    // // .attr("transform", function (d) { return "rotate(10," + d.source.x + "," + d.source.y + ")" });
    // pathText.append("textPath")
    //     .attr("text-anchor", "start")
    //     .attr("startOffset", "8%")
    //     .attr("xlink:href", function (d) { return "#" + d.id })
    //     .text(function (d) { return d.start; });

    // pathText.append("textPath")
    //     .style("text-anchor", "end")
    //     .attr("startOffset", "100%")
    //     .attr("xlink:href", function (d) { return "#" + d.id })
    //     .text(function (d) { return d.end; });


    // var pathStartText = container.selectAll(".pathStartText")
    //     .data(links)
    //     .enter()
    //     .append("text")
    //     // .attr("rotate", "270")
    //     .attr("fill", "#626567")
    //     // .attr("stroke", "#626567")
    //     // .attr("stroke-width", 1)
    //     .attr("font-size", "0.5em")
    //     // .attr("writing-mode", "lr")
    //     // .attr("glyph-orientation-vertical", 0)
    //     .attr("alignement-baseline", "middle")
    //     .attr("transform", function (d) {
    //         if (d.i == "straight") {
    //             return "translate(5,0)";
    //         }
    //         // return "rotate(10," + d.source.x + "," + d.source.y + ")";
    //         return "rotate(20," + d.source.x + "," + d.source.y + ")";

    //     });
    // pathStartText.append("textPath")
    //     .attr("text-anchor", "start")
    //     .attr("startOffset", "10%")
    //     .attr("xlink:href", function (d) { return "#" + d.id })
    //     .text(function (d) { return d.start; });
    // pathStartText.attr("transform", function (d) { return "rotate(10," + d.source.x + "," + d.source.y + ")" });

    // var pathEndText = container.selectAll(".pathEndText")
    //     .data(links)
    //     .enter()
    //     .append("text")
    //     // .attr("rotate", function (d) {
    //     //     if (d.i == "straight") {
    //     //         return "-90";
    //     //     }
    //     //     return "90"
    //     // })
    //     .attr("writing-mode", "lr")
    //     .attr("glyph-orientation-vertical", 0)
    //     .attr("fill", "#626567")
    //     // .attr("stroke", "#626567")
    //     // .attr("stroke-width", 1)
    //     .attr("font-size", "0.5em")
    //     .attr("transform", function (d) {
    //         if (d.i == "straight") {
    //             return "translate(-10,0)";
    //         }
    //         return "rotate(20," + d.target.x + "," + d.target.y + ")"
    //     });
    // pathEndText.append("textPath")
    //     .style("text-anchor", "end")
    //     .attr("startOffset", "90%")
    //     .attr("xlink:href", function (d) { return "#" + d.id })
    //     .text(function (d) { return d.end; });

    d3.select('#resetSVG1').on('click.restr', function () {
        d3.transition().duration(250).tween("zoom", function () {
            var si = d3.interpolate(s, 1);
            var xi = d3.interpolate(x, 0);
            var yi = d3.interpolate(y, 0);
            return function (t) {
                svg.call(zoom.translate([xi(t), yi(t)]).scale(si(t)).event);
            }
        });
    });

    d3.selectAll('.node').on('click.n', function () {
        var node = d3.select(this);
        node.transition().duration(250).tween("zoom", function () {
            child = this.children[0];
            var r = child.getAttribute('r') * 1;
            var d = this.getAttribute('transform');
            elem = d.match(/[-+]?[0-9]*\.?[0-9]+/g).map(Number);
            var cx = elem[0] * 1;
            var cy = elem[1] * 1;
            var si = d3.interpolate(s, 4);
            var xi = d3.interpolate(x, (width - r) / 2 - 4 * cx);
            var yi = d3.interpolate(y, (height - r) / 2 - 4 * cy);
            return function (t) {
                xn = xi(t);
                yn = yi(t);
                sn = si(t);
                svg.call(zoom.translate([xn, yn]).scale(sn).event);
            }
        });
    });
    svg.call(zoom.event);
    return svg;
}

//generating basic tree from the tree path
function genBasicTree(children_tree, t = 0, depth = 0) {
    children = children_tree[t];
    if (children) {
        tree = [t, children.map((v) => { return genBasicTree(children_tree, v, depth + 1); })];
        len = tree[1].length;
        c = tree[1];
        tree_depths = new Array(len).fill(0).map((v, i) => c[i][2]).sort();
        // console.log(tree_depths);
        tree.push(tree_depths[len - 1]);
        return tree
    }
    else {
        return [t, [], depth];
    }
}

function Tree(t, depth = 0, parent = null, number = 1) {
    this.x = -1,
        this.y = depth,
        this.t = t[0],//id
        this.parent = parent,
        this.children = t[1].map((v, i) => { return new Tree(v, depth + 1, this, i + 1); }),
        this.thread = null,
        this.mod = 0,//the offset of the node
        this.ancestor = this,
        this.change = this.shift = 0,
        this.number = number,// the number of node in its siblings 1..n
        this.right = () => {
            len = this.children.length;
            if (len > 0) {
                return this.children[len - 1];
            }
            else {
                return this.thread;
            }
        },

        this.left = () => {
            len = this.children.length;
            if (len > 0) {
                return this.children[0];
            }
            else {
                return this.thread;
            }
        },

        this.lms = () => {
            if (this.parent && this.number != 1) {
                return this.parent.children[0]
            }
            return null
        },
        this.lb = () => {
            if (this.parent && this.number != 1) {
                return this.parent.children[this.number - 2]
            }
            return null;
        }
}

function getWide(tree, wide) {
    wide[tree.y] += 1;
    if (tree.children.length > 0) {
        for (c in tree.children) {
            wide = getWide(tree.children[c], wide);
        }
    }
    return wide;
}

//calculate Tree (walker's tree drawing algorithm)
function setPrimCoordination(tree, distance = 1) {
    len = parseInt(tree.children.length);
    // console.log(len);
    if (len == 0) {
        // console.log("child");
        lb = tree.lb();
        if (lb) {
            tree.x = lb.x + distance;
            // console.log("d:", distance);
        }
        else {
            tree.x = distance / 2;
        }
        // console.log("x:", tree.x);
    }
    else {
        //the default ancestor of its children is the leftmost childrens
        def_ancestor = tree.children[0];
        for (child in tree.children) {
            c_tree = tree.children[child];
            c_tree = setPrimCoordination(c_tree, distance);
            def_ancestor = setAncestor(c_tree, def_ancestor, distance);
            // console.log( "finished c ="+c_tree.t);
        }
        // console.log( "finished v ="+tree.t+"children");
        exe_Shift(tree);
        len = parseInt(tree.children.length);
        midpos = (tree.children[0].x + tree.children[len - 1].x) / 2;
        col = tree.children[0];
        cor = tree.children[len - 1];
        lb = tree.lb()
        if (lb) {
            tree.x = lb.x + distance;
            tree.mod = tree.x - midpos;
        }
        else {
            tree.x = midpos;
        }
    }
    return tree;
}

function setAncestor(tree, def_ancestor, distance) {
    lb = tree.lb();
    if (lb) {
        ir = or = tree;
        il = lb;
        ol = tree.lms();
        mir = mor = ir.mod;
        mil = il.mod;
        mol = ol.mod;
        while (il.right() && ir.left()) {
            il = il.right();
            ir = ir.left();
            ol = ol.left();
            or = or.right();
            or.ancestor = tree;
            shift = (il.x + mil) - (ir.x + mir) + distance;
            if (shift > 0) {
                if (tree.parent.children.indexOf(il.ancestor) > -1) {
                    ancestor = il.ancestor;
                }
                else {
                    ancestor = def_ancestor;
                }
                moveSubtree(ancestor, tree, shift);
                mir = mir + shift;
                mor = mor + shift;
            }
            mil += il.mod;
            mir += ir.mod;
            mol += ol.mod;
            mor += or.mod;
        }

        if (il.right() && !or.right()) {
            or.thread = il.right();
            or.mod += mil - mor;
        }
        if (ir.left() && !ol.left()) {
            ol.thread = ir.left();
            ol.mod += mir - mol;
            def_ancestor = tree;
        }
    }
    return def_ancestor;
}

function moveSubtree(ancestor, tree, shift) {
    interval = tree.number - ancestor.number;
    tree.change -= shift / interval;
    tree.shift += shift;
    ancestor.change += shift / interval;
    tree.x += shift
    tree.mod += shift;
}

function exe_Shift(tree) {
    shift = change = 0;
    for (c in tree.children) {
        tree.children[c].x += shift;
        tree.children[c].mod += shift;
        change += tree.children[c].change;
        shift += tree.children[c].shift + change;
    }
}

function setTargetCoordination(tree, h, m = 0, min = null, max = null) {
    tree.x += m;
    tree.y = h / 2 + h * tree.y;
    if (!min || tree.x < min) {
        min = tree.x;
    }
    if (!max || tree.x > min) {
        max = tree.x;
    }
    range = [min, max];
    for (c in tree.children) {
        range = setTargetCoordination(tree.children[c], h, m + tree.mod, min, max);
    }

    return range;
}

function setFinalCoordination(tree, n) {
    tree.x += n;
    for (c in tree.children) {
        setFinalCoordination(tree.children[c], n);
    }
}



//draw another tree based method
function drawWholeTree(arr_path, vc, num, ep, id, width = 350, height = 350) {
    var start = new Date().getMilliseconds();
    // console.log("vwc:", vc);
    // console.log("pwt:", arr_path);
    n = vc.length;
    if (n == 1) {
        children_tree = vc;
    }
    else {
        children_tree = new Array();
        for (var i in vc) {
            children = new Array();
            for (var j in vc[i]) {
                haschild = false;
                for (p in arr_path) {
                    if (vc[i][j] == arr_path[p][0]) {
                        children.push(arr_path[p]);
                        haschild = true;
                        break;
                    }
                }
                if (!haschild) {
                    children.push(vc[i][j]);
                }
            }
            // console.log("childw:", children);
            children_tree.push(children);
        }
    }
    d_to_v = new Array(num);
    for (i in vc) {
        for (j in vc[i]) {
            d_to_v[vc[i][j]] = i;
        }
    }
    // console.log("cwt:", children_tree);
    // console.log("dtv", d_to_v);
    wholeBasicTree = genWholeBasicTree(children_tree, d_to_v);
    // console.log("wbt", wholeBasicTree);
    max_depth = wholeBasicTree.max_depth;
    h = (height - 30) / (max_depth + 1);
    wtree = new WholeTree(wholeBasicTree);
    console.log("mp:" + max_depth);
    // console.log(wtree);
    wide = getWide(wtree, new Array(max_depth + 1).fill(0));
    wide = wide.sort((a, b) => { return a - b; });
    max_wide = 0;
    if (n == 1) {
        max_wide = wide[1];
    }
    else {
        max_length = wide.length;
        for (i in wide) {
            divide = (parseInt(i) + 1) / max_length;
            max_wide += divide * wide[i];
        }
    }
    w = width / Math.ceil(max_wide);
    // console.log("wide", wide);
    // console.log("w", max_wide);
    setPrimCoordination(wtree, w);
    min = setTargetCoordination(wtree, h);
    midoffset = width / 2 - wtree.x;

    if (min < 0) {
        setFinalCoordination(wtree, -min);
    }
    else if (midoffset > 0) {
        setFinalCoordination(wtree, midoffset);
    }

    nodes = genWholeTreeNodes(wtree, max_depth);
    // console.log(nodes);
    //links = genWholeTreeLinks(nodes, arr_path, arr_tree, vc, ec);
    s_links = genWholeStraightTreePath(wtree, h);
    // console.log("links:", s_links);
    c_links = genwholeCurveTreePath(nodes, ep, height, width, h, w);
    // console.log("links:", c_links);
    svg = drawWholeTreeSVG(nodes, s_links, c_links, width, height, h, w, id);
    var end = new Date().getMilliseconds();
    console.log("m2:",end-start);
    return svg;
}

function WholeTree(t, depth = 0, parent = null, number = 1) {
    this.x = -1,
        this.y = depth,
        this.depth = depth;
    this.t = t.tree,//id
        this.type = t.type,
        this.parent = parent,
        this.children = t.children ? t.children.map((v, i) => { return new WholeTree(v, depth + 1, this, i + 1); }) : [],
        this.thread = null,
        this.mod = 0,//the offset of the node
        this.ancestor = this,
        this.change = this.shift = 0,
        this.number = number,// the number of node in its siblings 1..n
        this.right = () => {
            len = this.children.length;
            if (len > 0) {
                return this.children[len - 1];
            }
            else {
                return this.thread;
            }
        },

        this.left = () => {
            len = this.children.length;
            if (len > 0) {
                return this.children[0];
            }
            else {
                return this.thread;
            }
        },

        this.lms = () => {
            if (this.parent && this.number != 1) {
                return this.parent.children[0]
            }
            return null
        },
        this.lb = () => {
            if (this.parent && this.number != 1) {
                return this.parent.children[this.number - 2]
            }
            return null;
        }
}

function genWholeBasicTree(children_tree, d_to_v, parent_id = null, type = "vertices", t = 0, depth = 0) {
    if (type == "vertices") {
        children = children_tree[t];
        if (parent_id) {
            idx = children.indexOf(parent_id[0]);
            if (idx == children.length - 1) {
                children.pop();
            }
            else if (idx == 0) {
                children.shift();
            }
            else {
                children_1 = children.slice(0, idx);
                children = children.slice(idx + 1);
                // children.push.apply(children, children_1);
                children = children.concat(children_1);
            }
        }
        tree = { tree: t, type: type, children: children.map((v) => { return genWholeBasicTree(children_tree, d_to_v, null, "visual", v, depth + 1); }) };
        len = tree.children.length;
        if (len == 0) {
            max = depth;
        }
        else {
            c = tree.children;
            tree_depths = new Array(len).fill(0).map((v, i) => c[i].max_depth);
            // console.log("depth:",tree_depths);
            max = Math.max(...tree_depths);
        }
        // console.log("max:",max);
        tree["max_depth"] = max;
    }
    else if (type == "visual") {
        if (t.length == 2) {
            child = genWholeBasicTree(children_tree, d_to_v, [t[1]], "vertices", d_to_v[t[1]], depth + 1);
            tree = { tree: t, type: type, children: [child] };
            tree["max_depth"] = tree.children[0].max_depth;
        }

        else {
            tree = { tree: t, type: type, children: null, max_depth: depth };
        }
    }
    return tree
}

function genWholeTreeNodes(tree, max_depth, nodes = []) {
    if (tree.type == "visual" && tree.t.length != 2) {
        isbottom = false;
        lm = false;
        rm = false;
        ismiddle = false;
        if (tree.depth == max_depth) {
            isbottom = true;
        }
        if (tree.number == 1) {
            lm = true;
        }
        pos_length = tree.parent.children.length;
        if (tree.number == pos_length) {
            rm = true;
        }
        if (pos_length % 2 != 0) {
            middle = (pos_length + 1) / 2;
            if (tree.number == middle) {
                ismiddle = true;
            }
        }
        nodes.push({ x: tree.x, y: tree.y, id: tree.t, type: tree.type, i: "nonspanning", isbottom: isbottom, ismiddle: ismiddle, lm: lm, rm: rm, parent: { x: tree.parent.x, y: tree.parent.y } });
    }
    else {
        nodes.push({ x: tree.x, y: tree.y, id: tree.t, type: tree.type, i: "spanning" });
    }
    if (tree.children.length > 0) {
        for (c in tree.children) {
            nodes = genWholeTreeNodes(tree.children[c], max_depth, nodes);
        }
    }
    return nodes;
}

function genWholeStraightTreePath(tree, h, links = []) {
    if (tree.type == "vertices") {
        for (c in tree.children) {
            source = { x: tree.x, y: tree.y }
            child = tree.children[c];
            target = { x: child.x, y: child.y };
            mol = Math.sqrt(Math.pow((target.x - source.x), 2) + Math.pow((target.y - source.y), 2));
            dir_x = target.x - source.x;
            dir_y = target.y - source.y;
            h_1 = h / 3 > 10 ? 10 : h / 3;
            h_2 = h / 6 > 6 ? 6 : h / 6;
            s = { x: source.x + dir_x / mol * h_1, y: source.y + dir_y / mol * h_1 };
            t = { x: target.x - dir_x / mol * h_2, y: target.y - dir_y / mol * h_2 };
            if (child.t.length == 2) {
                links.push({ source: s, target: t, type: "bridge" });
                links = genWholeStraightTreePath(child, h, links);
            }
            else {
                links.push({ source: s, target: t, type: "normal" })
            }
        }
    }
    else if (tree.type == "visual") {
        source = { x: tree.x, y: tree.y }
        child = tree.children[0];
        target = { x: child.x, y: child.y };
        mol = Math.sqrt(Math.pow((target.x - source.x), 2) + Math.pow((target.y - source.y), 2));
        dir_x = target.x - source.x;
        dir_y = target.y - source.y;
        h_2 = h / 3 > 10 ? 10 : h / 3;
        h_1 = h / 6 > 6 ? 6 : h / 6;
        s = { x: source.x + dir_x / mol * h_1, y: source.y + dir_y / mol * h_1 };
        t = { x: target.x - dir_x / mol * h_2, y: target.y - dir_y / mol * h_2 };
        links.push({ source: s, target: t, type: "bridge" });
        links = genWholeStraightTreePath(child, h, links);
    }
    return links;
}

function genwholeCurveTreePath(nodes, perm, height, width, h, w, links = []) {
    nonspanning = {};
    for (n in nodes) {
        node = nodes[n];
        if (node.i == "nonspanning") {
            nonspanning[node.id] = node;
        }
    }
    keys_f = nodes.filter((v) => { return v.i == "nonspanning" });
    keys = new Array(keys_f.length).fill(0).map((v, i) => { return keys_f[i].id });
    bottom = 1;
    curve_l = 1;
    curve_r = 1;
    while (keys.length != 0) {
        start = keys.shift();
        end = perm[start];
        idx = keys.indexOf(end);
        keys.splice(idx, 1);
        s_node = nonspanning[start];
        e_node = nonspanning[end];
        offset = h / 6 > 6 ? 6 : h / 6;
        mol_s = Math.sqrt(Math.pow((s_node.x - s_node.parent.x), 2) + Math.pow((s_node.y - s_node.parent.y), 2));
        dir_s = { x: s_node.x - s_node.parent.x, y: s_node.y - s_node.parent.y };
        s = { x: s_node.x + dir_s.x / mol_s * offset, y: s_node.y + dir_s.y / mol_s * offset };
        mol_e = Math.sqrt(Math.pow((e_node.x - e_node.parent.x), 2) + Math.pow((e_node.y - e_node.parent.y), 2));
        dir_e = { x: e_node.x - e_node.parent.x, y: e_node.y - e_node.parent.y };
        t = { x: e_node.x + dir_e.x / mol_e * offset, y: e_node.y + dir_e.y / mol_e * offset };
        if (s_node.lm && e_node.lm || s_node.rm && s_node.rm) {
            if (s_node.rm) {
                c_s = true;
                c_t = false;
                control = curve_r;
                curve_r += 1;
            }
            else if (s_node.lm) {
                c_t = true;
                c_s = false;
                control = curve_l;
                curve_l += 1;
            }
            links.push({ source: s, target: t, c_s: c_s, c_t: c_t, bottom: control, id: "noncross" });
        }
        else {
            k_t = dir_e.y / dir_e.x;
            k_s = dir_s.y / dir_s.x;
            // if (s_node.isbottom || s_node.ismiddle) {
            //     k_s = null
            // }
            // if (e_node.isbottom || e_node.ismiddle) {
            //     k_t = null;
            // }
            if (s_node.ismiddle) {
                k_s = null
            }
            if (e_node.ismiddle) {
                k_t = null;
            }
            //same direction
            if (k_t > 0 && k_s > 0 || k_t < 0 && k_s < 0) {
                // if (k_t > 0) {
                if (Math.abs(k_s) >= Math.abs(k_t)) {
                    if (k_s < 0) {
                        if (s_node.x >= e_node.x) {
                            k_s = -k_s;
                        }
                        else {
                            k_t = -k_t;
                        }
                    }
                    else if (k_s > 0) {
                        if (s_node.x <= e_node.x) {
                            k_s = -k_s;
                        }
                        else {
                            k_t = -k_t;
                        }
                    }
                }
                else if (Math.abs(k_s) <= Math.abs(k_t)) {
                    if (k_t < 0) {
                        if (e_node.x >= s_node.x) {
                            k_t = -k_t;
                        }
                        else {
                            k_s = -k_s;
                        }
                    }
                    else if (k_t > 0) {
                        if (e_node.x <= s_node.x) {
                            k_t = -k_t;
                        }
                        else {
                            k_s = -k_s;
                        }
                    }
                }
                // }
                // else{
                //     if (Math.abs(k_s) < Math.abs(k_t)) {
                //         k_s = -k_s;
                //     }
                //     else {
                //         k_t = -k_t;
                //     }
                // }
            }
            //with middle
            if (!k_t && k_s) {
                if (k_s < 0 && e_node.x <= s_node.x || k_s > 0 && e_node.x >= s_node.x) {
                    k_s = -k_s
                }
            }
            else if (k_t && !k_s) {
                if (k_t < 0 && s_node.x <= e_node.x || k_t > 0 && s_node.x >= e_node.x) {
                    k_t = -k_t
                }
            }
            links.push({ source: s, target: t, c_s: k_s, c_t: k_t, bottom: bottom, id: "cross" });
            bottom += 1;
        }
    }
    num = bottom + 1;
    interval = 30 / num;
    interval_l = 1 / curve_l;
    interval_r = 1.5 / curve_r;
    for (l in links) {
        if (links[l].id == "cross") {
            link = links[l];
            n = link.bottom;
            x = (link.source.x + link.target.x) / 2;
            y = height - interval * n;
            c_sx = link.c_s ? (y - link.source.y) / link.c_s + link.source.x : link.source.x;
            c_tx = link.c_t ? (y - link.target.y) / link.c_t + link.target.x : link.target.x;
            if (!link.c_s && !link.c_t) {
                if (c_sx < c_tx) {
                    c_sx -= w / 4;
                    c_tx += w / 4;
                }
                else {
                    c_sx += w / 4;
                    c_tx -= w / 4;
                }
            }
            if (c_sx > width) {
                c_sx = (width - w / 4);
            }
            else if (c_sx <= 0) {
                c_sx = w / 4;
            }
            // if ((link.source.x - x) > 0 && (c_sx - x) < 0 || (link.source.x - x) < 0 && (c_sx - x) > 0) {
            //     c_sx = -c_sx + x;
            // }
            if (c_tx > width) {
                c_tx = (width - w / 4);
            }
            else if (c_tx <= 0) {
                c_tx = w / 4;
            }
            // if ((link.target.x - x) > 0 && (c_tx - x) < 0 || (link.target.x - x) < 0 && (c_tx - x) > 0) {
            //     c_tx = -c_tx + x;
            // }
            if ((c_sx - c_tx) / (link.source.x - link.target.x) < 0) {
                x = (c_sx + c_tx) / 2;
            }
            // if((link.source.y - link.target.y)>0 &&(link.source.x-link.target.y)>0 && link.c_s>0&&link.c_t<0){
            //     c_sx = -c_sx + x;
            //     c_tx = -c_tx + x;
            // }
            // if((link.target.y - link.source.y)>0 &&(link.target.x - link.source.x)>0&& link.c_t>0&&link.c_s<0){
            //     c_sx = -c_sx + x;
            //     c_tx = -c_tx + x;
            // }
            links[l].bottom = { x: x, y: y };
            links[l].c_s = { x: c_sx, y: y };
            links[l].c_t = { x: c_tx, y: y };
        }
        else {
            link = links[l];
            n = link.bottom;
            if (link.c_s) {
                curve = 1.5 - interval_r * n;
                // console.log("curve_r:", curve);
                control = cal_control(link.source, link.target, curve);
            }
            else {
                curve = -1.3 + interval_l * n;
                // console.log("curve_l:", curve);
                control = cal_control(link.source, link.target, curve);
            }
            dis_x = control.x - (link.source.x + link.target.x) / 2;
            dis_y = control.y - (link.source.y + link.target.y) / 2;
            s = { x: link.source.x + dis_x, y: link.source.y + dis_y }
            t = { x: link.target.x + dis_x, y: link.target.y + dis_y }
            mol_s = Math.sqrt(Math.pow((s.x - control.x), 2) + Math.pow((s.y - control.y), 2));
            mol_t = Math.sqrt(Math.pow((t.x - control.x), 2) + Math.pow((t.y - control.y), 2));
            s_x = s.x - (s.x - control.x) / mol_s * h / 4;
            t_x = t.x - (t.x - control.x) / mol_t * h / 4;
            c_s = { x: s_x <= 0 ? 5 : s_x, y: s.y - (s.y - control.y) / mol_s * h / 4 };
            c_t = { x: t_x <= 0 ? 5 : t_x, y: t.y - (t.y - control.y) / mol_t * h / 4 };
            // c_s = { x: s.x - (s.x - control.x) / mol_s * h / 4, y: s.y - (s.y - control.y) / mol_s * h / 4 };
            // c_t = { x: t.x - (t.x - control.x) / mol_t * h / 4, y: t.y - (t.y - control.y) / mol_t * h / 4 };
            links[l].bottom = control;
            links[l].c_s = c_s;
            links[l].c_t = c_t;
        }
    }
    return links;
}

function drawWholeTreeSVG(nodes, s_links, c_links, width, height, h, w, id) {
    var x, y, s;
    var zoom2 = d3.behavior.zoom()
        .translate([0, 0])
        .scaleExtent([1, 10])
        .scale(1)
        .on("zoom.wholetree", () => {
            // console.log("event", d3.event);
            x = d3.event.translate[0];
            y = d3.event.translate[1];
            s = d3.event.scale;
            container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });

    var svg = d3.select(id).append("svg:svg");
    svg.attr("width", width).attr("height", height)
        .call(zoom2);

    var container = svg.append("g");

    var circles = container.selectAll("circle")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "vertices")
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

    circles.append("circle")
        .attr("class", "vertex")
        .attr("r", function (d) {
            if (d.type == "vertices") {
                return h / 3 > 10 ? 10 : h / 3;
            }
            else {
                return w / 4 > 6 ? 6 : w / 4;
            }
        })
        .attr("fill", function (d) {
            if (d.type == "vertices") {
                return "#17202A";
            }
            else {
                return "none";
            }
        })
        .attr("stroke", function (d) {
            if (d.type == "visual") {
                return "";
            }
            else {
                return "none";
            }
        })
        .attr("stroke-width", 1)


    circles.append("text")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-size", function (d) {
            if (d.type == "vertices") {
                return h / 3 > 10 ? 20 : 2 * h / 3;
            }
            else {
                return w / 4 > 12 ? 12 : w / 4;
            }
        })
        .attr("fill", function (d) {
            if (d.type == "visual") {
                return "#797D7F";
            }
            else {
                return "#F7F9F9";
            }
        })
        .text(function (d) {
            if (d.type == "visual") {
                if (d.id.length == 2) {
                    return "(" + d.id[0] + "," + d.id[1] + ")";
                }
                else {
                    return d.id;
                }
            }
            else {
                return "";
            }
        });

    var straightPath = container.selectAll(".straightPath")
        .data(s_links)
        .enter()
        .append("path")
        .style("fill", "none")
        .style("stroke", function (d) {
            if (d.type == "bridge") { return "#CD5C5C"; }
            else { return "#17202A"; }
        })
        .style("stroke-width", function (d) {
            if (d.type == "bridge") { return w / 3 > 8 ? 8 : w / 3; }
            else { return w / 5 > 4 ? 4 : w / 5; }
            ;
        })
    // .attr("id", function (d) { return d.id; })
    straightPath.attr("d", function (d) {
        return "M" + d.source.x + "," + d.source.y + " L" + d.target.x + "," + d.target.y;
    });

    var curvePath = container.selectAll(".curvePath")
        .data(c_links)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke-dasharray", function (d) { return h / 3 + "," + h / 8 })
        .attr("stroke", "#17202A")
        .attr("stroke-width", function (d) {
            return w / 6 > 3 ? 3 : w / 6;
        })
    // .attr("id", function (d) { return d.id; })
    curvePath.attr("d", function (v) {
        return "M" + v.source.x + "," + v.source.y + " Q" + v.c_s.x + "," + v.c_s.y + "," + v.bottom.x + "," + v.bottom.y + " Q" + v.c_t.x + "," + v.c_t.y + "," + v.target.x + "," + v.target.y;
    })
        .on("mouseover", function (d) {
            var swidth = this.getAttribute("stroke-width");
            d3.select(this).attr("stroke", "#F1C40F")
                .attr("stroke-width", function (d) {
                    return swidth * 2;
                });
        })
        .on("mouseout", function (d) {
            var swidth = this.getAttribute("stroke-width");
            d3.select(this).attr("stroke", "#17202A")
                .attr("stroke-width", function (d) {
                    return swidth / 2;
                });
        });

    d3.select('#resetSVG2').on('click.rest', function () {
        d3.transition().duration(250).tween("zoom2", function () {
            var si = d3.interpolate(s, 1);
            var xi = d3.interpolate(x, 0);
            var yi = d3.interpolate(y, 0);
            return function (t) {
                svg.call(zoom2.translate([xi(t), yi(t)]).scale(si(t)).event);
            }
        });
    });

    d3.selectAll('.vertices').on('click.v', function () {
        var node = d3.select(this);
        node.transition().duration(250).tween("zoom2", function () {
            var circle = this.children[0];
            var r = circle.getAttribute('r') * 1;
            var d = this.getAttribute('transform');
            elem = d.match(/[-+]?[0-9]*\.?[0-9]+/g).map(Number);
            var cx = elem[0] * 1;
            var cy = elem[1] * 1;
            var si = d3.interpolate(s, 4);
            var xi = d3.interpolate(x, (width - r) / 2 - 4 * cx);
            var yi = d3.interpolate(y, (height - r) / 2 - 4 * cy);
            return function (t) {
                st = si(t);
                yt = yi(t);
                xt = xi(t);
                svg.call(zoom2.translate([xt, yt]).scale(st).event);
            }
        });
    });

    svg.call(zoom2.event);

    return svg;
}

function cal_control(source, target, curve = 0.5) {
    x1 = source.x;
    x2 = target.x;
    y1 = source.y;
    y2 = target.y;
    k2 = -(x2 - x1) / (y2 - y1);
    if (k2 < 2 && k2 > -2) {
        controlX = (x2 + x1) / 2 + curve * 30;
        controlX = controlX < 0 ? -controlX : controlX;
        controlY = k2 * (controlX - (x1 + x2) / 2) + (y1 + y2) / 2;
        controlY = controlY < 0 ? -controlY : controlY;
    } else {
        controlY = (y2 + y1) / 2 + curve * 30;
        controlY = controlY < 0 ? -controlY : controlY;
        controlX = k2 ? (controlY - (y1 + y2) / 2) / k2 + (x1 + x2) / 2 : (x1 + x2) / 2;
        controlX = controlX < 0 ? -controlX : controlX;
    }
    c = { x: controlX, y: controlY };
    return c;
}



//draw faces based method
function drawFace(faces, ep, id, width = 350, height = 350) {
    var start = new Date().getMilliseconds();
    var x, y, s;
    var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scaleExtent([1, 10])
        .scale(1)
        .on("zoom.face", zoomed);

    function zoomed() {
        // console.log("event", d3.event);
        x = d3.event.translate[0];
        y = d3.event.translate[1];
        s = d3.event.scale;
        container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    polygons = calPolygons(faces, ep, width, height);
    w = polygons.r_len;
    var svg = d3.select(id).append("svg:svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

    container = svg.append("g");
    // var polygonsSVG = svg.selectAll('polygon')
    //     .data(polygons.elements)
    //     .enter()
    //     .append('polygon')
    //     .attr('points', function (d) {
    //         if (d.num > 2) {
    //             return d.path;
    //         }
    //         return "";
    //     })
    //     .attr("fill", "none")
    //     .style("stroke", "#17202A")
    //     .style("stroke-width", function (d) {
    //         return w / 10 > 3 ? 3 : w / 10;
    //     });

    var midCircles = container.selectAll(".midCircles")
        .data(polygons.elements)
        .enter()
        .append("circle")
        .attr("class", "midpoints")
        .attr("r", w / 10)
        .attr("fill", "#B3B6B7")
        .attr("stroke", "none")
        .attr("stroke-width", 1)
        .attr("transform", function (d) { return "translate(" + d.r.x + "," + d.r.y + ")"; });

    edgesLinks = genEdgesLinks(polygons.elements, w);
    var simplePath = container.selectAll(".simplePath")
        .data(edgesLinks)
        .enter()
        .append("path")
        .style("fill", "none")
        .style("stroke", "#17202A")
        .style("stroke-width", function (d) {
            return w / d.sroundnum > 3 ? 3 : w / d.sroundnum / 3;
        })
    simplePath.attr("id", function (d) { return d.id; })
        .attr("d", function (d) {
            if (d.num == 1) {
                // return "M" + x1 + "," + y + "  A" + w / 2 + "," + w / 2 + " 0 1,0 " + x2 + "," + y;
                return "M" + d.source.x + "," + d.source.y + "  A" + w / 2 + "," + w / 2 + " 0 1,1 " + d.target.x + "," + d.target.y;
            }
            else if (d.num == 2) {
                // c1 = d.r.x + w / 4;
                // y = d.r.y;
                // c2 = d.r.x - w / 4;
                // return "M" + d.points[0].x + "," + d.points[0].y + " Q" + c1 + "," + y + "," + d.points[1].x + "," + d.points[1].y + " Q" + c2 + "," + y + "," + d.points[0].x + "," + d.points[0].y;
                return "M" + d.source.x + "," + d.source.y + " Q" + d.control.x + "," + d.control.y + "," + d.target.x + "," + d.target.y;
            }
            else {
                // return "";
                return "M" + d.source.x + "," + d.source.y + " L" + d.target.x + "," + d.target.y;
            }
        });

    var edgesText = container.selectAll(".edgesText")
        .data(edgesLinks)
        .enter()
        // .append("g")
        // .attr("class","facesedges")
        // .attr("follow",function (d) { return d.follow })
        .append("text")
        .attr("fill", "#17202A")
        .attr("font-size", function (d) {
            return w / d.sroundnum > w / 8 ? w / 8 : w / d.sroundnum;
        })
        .attr("dy", -w / 10);

    edgesText.append("textPath")
        .style("text-anchor", "middle")
        .attr("startOffset", "50%")
        .attr("xlink:href", function (d) { return "#" + d.id })
        .text(function (d) { return d.id; })
        .append("tspan")
        .style("stroke", "none")
        .attr("fill", "#F1948A")
        .text(function (d) { return d.follow; });

    links = new Array();
    nodes = new Array();
    pes = polygons.elements;
    pes_l = pes.length;
    for (i = 0; i < pes_l; i++) {
        poly = pes[i];
        if (poly.num == 1) {
            nodes.push({ x: poly.r.x, y: poly.r.y + w / 2, id: poly.points[0].id, sroundnum: poly.points.length });
            links.push({ path: "M" + poly.r.x + "," + poly.r.y + "  L" + poly.r.x + "," + (poly.r.y + w / 2), id: poly.points[0].id, sroundnum: poly.points.length });
        }
        else {
            p_points = poly.points;
            r = { x: poly.r.x, y: poly.r.y };
            p_points_length = p_points.length;
            for (j = 0; j < p_points_length; j++) {
                point = p_points[j];
                nodes.push({ x: point.x, y: point.y, id: point.id, sroundnum: poly.points.length });
                links.push({ path: "M" + r.x + "," + r.y + "  L" + point.x + "," + point.y, id: point.id, sroundnum: poly.points.length });
            }
        }
    }
    var helpPath = container.selectAll(".helpPath")
        .data(links)
        .enter()
        .append("path")
        .style("fill", "none")
        .style("stroke-dasharray", function (d) { return w / 6 + "," + w / 8 })
        .style("stroke", "#B3B6B7")
        .style("stroke-width", function (d) {
            return w / d.sroundnum > 2 ? 2 : w / d.sroundnum / 3;
        })

    helpPath.attr("d", function (d) {
        return d.path;
    });

    var edgesCircles = container.selectAll(".edgesCircles")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", function (d) { return d.sroundnum > 10 ? w / d.sroundnum : w / 10 })
        .attr("fill", "#17202A")
        .attr("stroke", "none")
        .attr("stroke-width", 1)
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

    d3.select('#resetSVG3').on('click.resface', function () {
        d3.transition().duration(250).tween("zoom", function () {
            var si = d3.interpolate(s, 1);
            var xi = d3.interpolate(x, 0);
            var yi = d3.interpolate(y, 0);
            return function (t) {
                svg.call(zoom.translate([xi(t), yi(t)]).scale(si(t)).event);
            }
        });
    });

    d3.selectAll("circle").on('click.mid', function () {
        var node = d3.select(this);
        node.transition().duration(250).tween("zoom", function () {
            var r = this.getAttribute("r");
            var d = this.getAttribute('transform');
            elem = d.match(/[-+]?[0-9]*\.?[0-9]+/g).map(Number);
            var cx = elem[0] * 1;
            var cy = elem[1] * 1;
            var si = d3.interpolate(s, 2);
            var xi = d3.interpolate(x, (width - r) / 2 - 2 * cx);
            var yi = d3.interpolate(y, (height - r) / 2 - 2 * cy);
            return function (t) {
                st = si(t);
                yt = yi(t);
                xt = xi(t);
                svg.call(zoom.translate([xt, yt]).scale(st).event);
            }
        });

    })

    svg.call(zoom.event);
    var end = new Date().getMilliseconds();
    console.log("end:",end,"start:",start,"m3:",end-start);
    return svg;
}

function calPolygons(faces, ep, width, height) {
    num = faces.length;
    num_x = 0;
    m = Math.sqrt(num);
    isSqrt = false;
    if (m * m == num) {
        w = width / m;
        h = height / m;
        isSqrt = true;
    }
    else {
        if (num % 3 == 0) {
            num_x = num / 3;
        }
        else {
            num_x = Math.ceil(num / 3);
        }
        w = width / num_x;
        h = height / 3;
    }

    min_v = Math.min(w, h);
    r = 2 * min_v / 5;
    // polygons = { r: [], path: [], points: [] };
    polygons = { r_len: r, elements: [] };
    for (f in faces) {
        polygonPoints = new Array();
        polygonPath = "";
        idx = parseInt(f);
        if (isSqrt) {
            r_xn = idx % m;
            r_yn = Math.floor(idx / m);
        }
        else {
            r_xn = idx % num_x;
            r_yn = Math.floor(idx / num_x);
        }
        r_x = w / 2 + (r_xn) * w;
        r_y = h / 2 + (r_yn) * h;
        edge_num = faces[f].length;
        rad = 2 * Math.PI / edge_num;
        for (i = 0; i < edge_num; i++) {
            x = r_x + r * Math.sin(i * rad);
            y = r_y + r * Math.cos(i * rad);
            polygonPath += x + "," + y + " ";
            id_s = faces[f][i];
            id_end = ep[id_s];
            polygonPoints.push({ x: x, y: y, id: id_s, follow: "(-->" + id_end + ")" });
        }
        polygon = { r: { x: r_x, y: r_y }, fid: "face" + f, path: polygonPath, points: polygonPoints, num: edge_num };
        polygons.elements.push(polygon);
        // polygons.r.push({ x: r_x, y: r_y });
        // polygons.path.push(polygonPath);
        // polygons.points.push(polygonPoints);
    }

    return polygons;
}

function genEdgesLinks(polygons, w) {
    links = new Array();
    p_num = polygons.length;
    for (p = 0; p < p_num; p++) {
        polygon = polygons[p]
        points = polygon.points;
        points_len = points.length;
        if (points_len == 1) {
            link = { target: { x: polygon.r.x + w / 20, y: polygon.r.y + w / 2 }, source: { x: polygon.r.x - w / 20, y: polygon.r.y + w / 2 }, num: points_len, id: points[0].id, follow: points[0].follow, fid: polygon.fid, sroundnum: polygon.points.length };
            links.push(link);
        }
        else if (points_len == 2) {
            link_1 = { source: { x: polygon.points[1].x + w / 20, y: polygon.points[1].y }, target: { x: polygon.points[0].x + w / 20, y: polygon.points[0].y }, control: { x: polygon.r.x + w / 4, y: polygon.r.y }, num: points_len, id: points[0].id, follow: points[0].follow, fid: polygon.fid, sroundnum: polygon.points.length };
            links.push(link_1);
            link_2 = { source: { x: polygon.points[0].x - w / 20, y: polygon.points[0].y }, target: { x: polygon.points[1].x - w / 20, y: polygon.points[1].y }, control: { x: polygon.r.x - w / 4, y: polygon.r.y }, num: points_len, id: points[1].id, follow: points[1].follow, fid: polygon.fid, sroundnum: polygon.points.length };
            links.push(link_2);
        }
        else {
            for (i = 0; i < points_len; i++) {
                point_1 = points[i];
                if (i == points_len - 1) {
                    point_2 = points[0];
                }
                else {
                    point_2 = points[i + 1];
                }
                link = { source: { x: point_2.x, y: point_2.y }, target: { x: point_1.x, y: point_1.y }, num: points_len, id: point_1.id, follow: point_1.follow, fid: polygon.fid, sroundnum: polygon.points.length };
                links.push(link);
            }
        }
    }
    return links;
}