window.onload = function () {
    //popover
    $(function () {
        $('[data-toggle="popover"]').popover()
    });

    Vue.prototype.$ajax = axios;

    //the instance of output
    // var output = new Vue({
    //     el: '#output',
    //     data: {
    //         isShow:true,
    //         spanningTreeString:'',
    //         //Faces
    //         facesString: '',
    //         warningFaces: '#343a40',
    //         facesCyclesString: '',
    //         facesPermutationsString: '',
    //         //Vertices
    //         warningVerticesCycles: '#343a40',
    //         verticesCyclesString: '',
    //         warningVerticesPermutations: '#343a40',
    //         verticesPermutationsString: '',
    //         //Edges
    //         warningEdgesCycles: '#343a40',
    //         edgesCyclesString: '',
    //         warningEdgesPermutations: '#343a40',
    //         edgesPermutationsString: '',
    //     }
    // });

    //the instance of input
    var type1 = new Vue({
        el: '#type1',
        data: {
            //Example
            rooted: '',
            unrooted: '',
            //Specific
            dartsNumber: '',
            dartsNUmErrMsg: '',
            inputDartsNumError: false,
            isDisabled: true,
            inputVertices: '{(0),(1,2,3)}',
            inputVerticesError: false,
            inputVerticesCorrect: false,
            verticesErrMsg: '',
            inputEdges: '{(0,1),(2,3)}',
            inputEdgesError: false,
            inputEdgesCorrect: false,
            edgesErrMsg: '',
            //Random
            isRandomDisabled: true,
            randomDartsNumber: '',
            randomDartsNumberError: false,
            randomDartsNumberErrMsg: '',
            randomVerticesNumber: '',
            randomVerticesNumberError: false,
            randomVerticesNumberErrMsg: '',
            //ouput
            output: {
                isVerticesShow: false,
                isEdgesShow: false,
                isFacesShow: false,
                warningVerticesString: '',
                warningVerticesColor: '#343a40',
                warningEdgesString: '',
                warningEdgesColor: '#343a40',
                warningFacesString: '',
                warningFacesColor: '#343a40',
                spanningTreeString: '',
                spanningTreePath: '',
                //Faces
                facesCyclesString: '',
                facesPermutationsString: '',
                //Vertices
                verticesCyclesString: '',
                verticesPermutationsString: '',
                //Edges
                edgesCyclesString: '',
                edgesPermutationsString: '',
                genusNumber: '',
                dartsNumber: '',
                faceNumber:'',
                verticesNumber:'',
            },
        },
        watch: {
            dartsNumber: function () {
                if (this.dartsNumber && this.dartsNumber % 2 == 0) {
                    this.inputDartsNumError = false;
                    this.dartsNUmErrMsg = "";
                    this.isDisabled = false;
                }
                else {
                    if (this.dartsNumber % 2 != 0) {
                        this.inputDartsNumError = true;
                        this.dartsNUmErrMsg = "The number should be the mutiple of 2!";
                    }
                    this.isDisabled = true;
                }
            },
            inputVertices: function () {
                var vertices = /^\{(\([0-9]+(,[0-9]+)*\))(,\([0-9]+(,[0-9]+)*\))*}$/;
                if (!this.inputVertices) {
                    this.inputVerticesError = true;
                    this.verticesErrMsg = 'Vertices required!';
                }
                else if (!vertices.test(this.inputVertices)) {
                    this.inputVerticesError = true;
                    this.verticesErrMsg = 'The format error!(example:{(0),(1,2,3)})';
                }
                else {
                    this.inputVerticesError = false;
                    this.inputVerticesCorrect = true;
                    this.verticesErrMsg = ''
                }
            },
            inputEdges: function () {
                var edges = /^\{(\([0-9]+(,[0-9]+)\))(,\([0-9]+(,[0-9]+)\))*}$/;
                if (!this.inputEdges) {
                    this.inputEdgesError = true;
                    this.edgesErrMsg = 'Edges required!';
                }
                else if (!edges.test(this.inputEdges)) {
                    this.inputEdgesError = true;
                    this.edgesErrMsg = 'The format error!(example:{(0,1),(2,3)})';
                }
                else {
                    this.inputEdgesError = false;
                    this.inputEdgesCorrect = true;
                    this.edgesErrMsg = '';
                }
            },
            randomDartsNumber: function () {
                if (this.randomDartsNumber && this.randomDartsNumber % 2 == 0) {
                    this.randomDartsNumberError = false;
                    this.randomDartsNumberErrMsg = "";
                    this.isRandomDisabled = false;
                }
                else {
                    if (this.randomDartsNumber % 2 != 0) {
                        this.randomDartsNumberError = true;
                        this.randomDartsNumberErrMsg = "The number should be the mutiple of 2!";
                    }
                    this.isRandomDisabled = true;
                }
            },
            randomVerticesNumber: function () {
                if (this.randomVerticesNumber && this.randomVerticesNumber < this.randomDartsNumber) {
                    this.randomVerticesNumberError = false;
                    this.randomVerticesNumberErrMsg = "";
                }
                else {
                    if (this.randomVerticesNumber >= this.randomDartsNumber) {
                        this.randomVerticesNumberError = true;
                        this.randomVerticesNumberErrMsg = "The number of vertices could not larger than the number of darts!";
                    }
                }
            }
        },
        created: function () {
            this.$ajax.get('../javascript/data.json').then(response => {
                this.rooted = response.data.Default.Rooted;
                this.unrooted = response.data.Default.Unrooted;
                // console.log(this.rooted);
            }).catch(function () {
            })
        },
        methods: {
            //for exmaple tab
            checkOption: function (checkIndex, type) {
                console.log(checkIndex);
                $.each(this.rooted, function (index, item) {
                    item.checked = false;
                });
                $.each(this.unrooted, function (index, item) {
                    item.checked = false;
                });
                if (type == "rooted") {
                    this.rooted[checkIndex].checked = true;
                }
                else {
                    this.unrooted[checkIndex].checked = true;
                }
            },
            createExample: function () {
                this.resetThePage();
                vertices = "", edges = "", dartsNumber = 0, found = false;
                $.each(this.unrooted, function (i, v) {
                    if (v.checked) {
                        vertices = v.vertices;
                        edges = v.edges;
                        dartsNumber = v.darts_number;
                        found = true;
                    }
                });
                if (!found) {
                    $.each(this.rooted, function (i, v) {
                        if (v.checked) {
                            vertices = v.vertices;
                            edges = v.edges;
                            dartsNumber = v.darts_number;
                            found = true;
                        }
                    });
                }
                this.ouput.warningVerticesString = "Loading Vertices...";
                this.parseValue(vertices, dartsNumber, "vertices");
                drawCycles('#verticesCycleGraph', this.output.verticesCyclesString, dartsNumber);
                drawPermutation('#verticesPermutationsGraph', this.output.verticesPermutationsString, dartsNumber);
                this.output.isVerticesShow = true;
                this.ouput.warningVerticesString = "";
                this.ouput.warningEdgesString = "Loading Edges...";
                this.parseValue(edges, dartsNumber, "edges");
                drawCycles('#edgesCycleGraph', this.output.edgesCyclesString, dartsNumber);
                drawPermutation('#edgesPermutationsGraph', this.output.edgesPermutationsString, dartsNumber);
                this.output.isEdgesShow = true;
                this.ouput.warningEdgesString = "";
                this.ouput.warningFacesString = "Loading Faces & Others..."
                var arr_v = JSON.parse(JSON.stringify(this.output.verticesCyclesString));
                if (this.validateTheConnection(arr_v, this.output.edgesPermutationsString)) {
                    arr_v = JSON.parse(JSON.stringify(this.output.verticesCyclesString));
                    this.genFaces(arr_v, dartsNumber);
                    drawCycles('#facesCycleGraph', this.output.facesCyclesString, dartsNumber);
                    drawPermutation('#facesPermutationsGraph', this.output.facesPermutationsString, dartsNumber);
                    width = 600; height = 600;
                    svg = drawTree(this.output.spanningTreeString, this.output.spanningTreePath, this.ouput.verticesCyclesString, this.output.edgesCyclesString, '#treeBase', width, height);
                    this.showInCanvas(svg, "treeBasedimage");
                    svg = drawWholeTree(this.output.spanningTreePath, this.output.verticesCyclesString, dartsNumber, this.ouput.edgesPermutationsString, "#wholetreeBase", width, height);
                    this.showInCanvas(svg, "treeBasedimage2");
                    svg = drawFace(this.output.facesCyclesString, this.ouput.edgesPermutationsString, "#faceBase", width, height);
                    this.showInCanvas(svg, "faceBasedimage");
                }
                this.$nextTick(function () {
                    document.querySelector("#outputArea").scrollIntoView({ behavior: "smooth", block: "start" });
                })
            },
            //for specific tab
            create: function () {
                this.resetThePage();
                this.ouput.warningVerticesString = "Loading Vertices...";
                //parse the vertices
                if (this.parseVertices()) {
                    drawCycles('#verticesCycleGraph', this.output.verticesCyclesString, this.dartsNumber);
                    drawPermutation('#verticesPermutationsGraph', this.output.verticesPermutationsString, this.dartsNumber);
                    this.output.isVerticesShow = true;
                    this.ouput.warningVerticesString = "";
                    this.ouput.warningEdgesString = "Loading Edges...";
                    //parse the edges
                    if (this.parseEdges()) {
                        drawCycles('#edgesCycleGraph', this.output.edgesCyclesString, this.dartsNumber);
                        drawPermutation('#edgesPermutationsGraph', this.output.edgesPermutationsString, this.dartsNumber);
                        this.output.isEdgesShow = true;
                        this.ouput.warningEdgesString = "";
                        this.ouput.warningFacesString = "Loading Faces & Others..."
                        //Validate the connection
                        var arr_v = JSON.parse(JSON.stringify(this.output.verticesCyclesString));
                        if (this.validateTheConnection(arr_v, this.output.edgesPermutationsString)) {
                            arr_v = JSON.parse(JSON.stringify(this.output.verticesCyclesString));
                            this.genFaces(arr_v, this.dartsNumber);
                            drawCycles('#facesCycleGraph', this.output.facesCyclesString, this.dartsNumber);
                            drawPermutation('#facesPermutationsGraph', this.output.facesPermutationsString, this.dartsNumber);
                            width = 600; height = 600;
                            svg = drawTree(this.output.spanningTreeString, this.output.spanningTreePath, this.ouput.verticesCyclesString, this.output.edgesCyclesString, '#treeBase', width, height);
                            this.showInCanvas(svg, "treeBasedimage");
                            svg = drawWholeTree(this.output.spanningTreePath, this.output.verticesCyclesString, this.dartsNumber, this.ouput.edgesPermutationsString, "#wholetreeBase", width, height);
                            this.showInCanvas(svg, "treeBasedimage2");
                            svg = drawFace(this.output.facesCyclesString, this.ouput.edgesPermutationsString, "#faceBase", width, height);
                            this.showInCanvas(svg, "faceBasedimage");
                        }
                    }
                }
                this.$nextTick(function () {
                    document.querySelector("#outputArea").scrollIntoView({ behavior: "smooth", block: "start" });
                })
            },
            //for randim tab
            createRandom: function () {
                this.resetThePage();
                if (!this.randomDartsNumber) {
                    this.output.warningVerticesString = "The number of darts required!";
                    this.output.warningVerticesColor = '#CB4335';
                }
                else if (this.randomDartsNumber % 2 != 0) {
                    this.output.warningVerticesString = "The number of darts should be the mutiple of 2!";
                    this.output.warningVerticesColor = '#CB4335';
                }
                else {
                    if (this.randomVerticesNumber > this.randomDartsNumber) {
                        this.output.warningVerticesColor = '#CB4335';
                        this.output.warningVerticesString = "The number of vertices could not larger than the number of darts!";
                    }
                    // console.log(this.randomVerticesNumber);
                    edges_cycle = null, edges_perm = null, vertices_perm = null, vertices_cycle = null, result = null;
                    do {
                        edges_cycle = this.genRandomEdges(this.randomDartsNumber);
                        edges_perm = this.convertToPermutations(edges_cycle, this.randomDartsNumber);
                        if (!this.randomVerticesNumber) {
                            vertices_perm = this.genRandomVerticesPerm(this.randomDartsNumber);
                            vertices_cycle = this.convertToCycles(vertices_perm, this.randomDartsNumber);
                            console.log(vertices_cycle);
                        }
                        else {
                            vertices_cycle = this.genRandomVerticesByNum(this.randomDartsNumber, this.randomVerticesNumber);
                            vertices_perm = this.convertToPermutations(vertices_cycle, this.randomDartsNumber)
                            console.log(vertices_cycle);
                        }
                        var arr_v = JSON.parse(JSON.stringify(vertices_cycle));
                        result = this.isConnected(arr_v, edges_perm);
                        console.log(result);
                    } while (!result.res);
                    // console.log(vertices_cycle);
                    this.output.spanningTreeString = result.vpath;
                    this.output.spanningTreePath = result.dpath;
                    this.ouput.verticesCyclesString = vertices_cycle;
                    this.ouput.verticesPermutationsString = vertices_perm;
                    this.ouput.warningVerticesString = "Loading Vertices...";
                    drawCycles('#verticesCycleGraph', vertices_cycle, this.randomDartsNumber);
                    drawPermutation('#verticesPermutationsGraph', vertices_perm, this.randomDartsNumber);
                    this.output.isVerticesShow = true;
                    this.ouput.warningVerticesString = "";
                    this.ouput.edgesCyclesString = edges_cycle;
                    this.ouput.edgesPermutationsString = edges_perm;
                    this.ouput.warningEdgesString = "Loading Edges...";
                    drawCycles('#edgesCycleGraph', edges_cycle, this.randomDartsNumber);
                    drawPermutation('#edgesPermutationsGraph', edges_perm, this.randomDartsNumber);
                    this.output.isEdgesShow = true;
                    this.ouput.warningEdgesString = "";
                    this.ouput.warningFacesString = "Loading Faces & Others..."
                    this.genFaces(vertices_cycle, this.randomDartsNumber);
                    console.log(this.output.edgesPermutationsString);
                    drawCycles('#facesCycleGraph', this.output.facesCyclesString, this.randomDartsNumber);
                    drawPermutation('#facesPermutationsGraph', this.output.facesPermutationsString, this.randomDartsNumber);
                    this.output.isFacesShow = true;
                    this.ouput.warningFacesString = "";
                    width = 600; height = 600;
                    svg = drawTree(result.vpath, result.dpath, vertices_cycle, edges_cycle, '#treeBase', width, height);
                    this.showInCanvas(svg, "treeBasedimage");
                    svg = drawWholeTree(result.dpath, vertices_cycle, this.randomDartsNumber, edges_perm, "#wholetreeBase", width, height);
                    this.showInCanvas(svg, "treeBasedimage2");
                    svg = drawFace(this.output.facesCyclesString, this.ouput.edgesPermutationsString, "#faceBase", width, height);
                    this.showInCanvas(svg, "faceBasedimage");
                }
                this.$nextTick(function () {
                    document.querySelector("#outputArea").scrollIntoView({ behavior: "smooth", block: "start" });
                })
            },
            genRandomEdges: function (num) {
                edges_count = num / 2;
                edges = new Array();
                darts = new Array(num).fill(0).map((v, i) => { return v + i; });
                // console.log("darts:"+d1);
                while (darts.length != 0) {
                    d1 = Math.floor(Math.random() * darts.length);
                    // console.log("d1:"+d1);
                    v1 = darts[d1];
                    darts.splice(d1, 1);
                    d2 = Math.floor(Math.random() * darts.length);
                    v2 = darts[d2];
                    darts.splice(d2, 1);
                    perm = [v1, v2].sort((a, b) => { return a - b });
                    edges.push(perm);
                }
                // console.log(edges);
                return edges;
            },
            genRandomVerticesPerm: function (num) {
                perm = new Array(num).fill(0).map((v, i) => { return v + i; });
                for (i in perm) {
                    j = Math.floor(Math.random() * num);
                    a = perm[i]
                    perm[i] = perm[j]
                    perm[j] = a
                }
                return perm
            },
            genRandomVerticesByNum: function (dnum, vnum) {
                while (true) {
                    darts = this.sample(vnum, dnum);
                    flag = false;
                    for (let i = 0; i < vnum; i++) {
                        if (darts.indexOf(i) == -1) {
                            flag = true;
                        }
                    }
                    if (!flag) {
                        break;
                    }
                }
                console.log("ver", darts);
                vertices = new Array(vnum).fill(0).map((v, i) => {
                    let indexes = new Array(), j;
                    for (j = 0; j < dnum; j++) {
                        if (darts[j] == i) {
                            indexes.push(j);
                        }
                    }
                    return indexes;
                });
                console.log("ver", vertices);
                return vertices;
            },
            sample: function (n, repetations = 10) {
                prob = new Array(n).fill(1 / n);
                res = this.genAliasAndProbs(prob);
                probs = res.probs;
                alias = res.alias;
                selects = [];
                while (repetations != 0) {
                    column = Math.floor(Math.random() * n);
                    c = Math.random();
                    p = probs[column];
                    if (p > c) {
                        select = column;
                    }
                    else {
                        select = alias[column];
                    }
                    repetations -= 1;
                    selects.push(select);
                }
                return selects;
            },
            genAliasAndProbs: function (prob) {
                n = prob.length;
                larges = new Array();
                smalls = new Array();

                // alias record the index of who divide to the current element
                // the probs for current element about the divide operate
                alias = new Array(n).fill(0);
                probs = new Array(n).fill(0);

                // seperate prob in two list
                // large record the position with high prob, the small as contrary
                narr = new Array(n).fill(0);
                for (i = 0; i < n; i++) {
                    a = n * prob[i];
                    probs[i] = a;
                    if (a < 1) {
                        smalls.push(i);
                    }
                    else {
                        larges.push(i);
                    }
                }

                // divide large to small so that make small as 1
                while (smalls.length > 0 && larges.length > 0) {
                    small = smalls.pop();
                    large = larges.pop();

                    alias[small] = large;
                    probs[large] = probs[large] - (1 - probs[small]);

                    if (probs[large] < 1) {
                        smalls.push(large)
                    }
                    else {
                        larges.append(large)
                    }
                }
                value = { probs: probs, alias: alias };
                return value;
            },
            resetThePage: function () {
                d3.selectAll("svg").remove();
                // this.$nextTick(function () {
                this.ouput = Object.assign(this.output, {
                    isVerticesShow: false,
                    isEdgesShow: false,
                    isFacesShow: false,
                    warningVerticesString: '',
                    warningVerticesColor: '#343a40',
                    warningEdgesString: '',
                    warningEdgesColor: '#343a40',
                    warningFacesString: '',
                    warningFacesColor: '#343a40',
                    spanningTreeString: '',
                    spanningTreePath: '',
                    //Faces
                    facesCyclesString: '',
                    facesPermutationsString: '',
                    //Vertices
                    verticesCyclesString: '',
                    verticesPermutationsString: '',
                    //Edges
                    edgesCyclesString: '',
                    edgesPermutationsString: '',
                    genusNumber: '',
                    dartsNumber: '',
                    faceNumber:'',
                    verticesNumber:'',
                });
                // })
            },
            //Parse and Valid inputß
            //Parse vertices string
            parseVertices: function () {
                var vertices = /^\{(\([0-9]+(,[0-9]+)*\))(,\([0-9]+(,[0-9]+)*\))*}$/;
                if (!this.inputVertices) {
                    this.output.warningVerticesString = 'Vertices required!';
                    this.output.warningVerticesColor = '#CB4335';
                }
                else if (!vertices.test(this.inputVertices)) {
                    this.output.warningVerticesString = 'The format of vertices is error!(example:{(0),(1,2,3)})';
                    this.output.warningVerticesColor = '#CB4335';
                }
                else {
                    verticesArr = this.inputVertices.match(/\d+/g).map(Number);
                    // output.facesString=this.dartsNumber;
                    var flag = false;
                    if (this.isRepeat(verticesArr)) {
                        this.output.warningVerticesString = "The index of darts in vertices repeat!";
                        this.output.warningVerticesColor = '#CB4335';
                    }
                    else if (this.isOutOfRange(verticesArr)) {
                        this.output.warningVerticesString = "The index of darts in vertices out of range!";
                        this.output.warningVerticesColor = '#CB4335';
                    }
                    else if (verticesArr.length != this.dartsNumber) {
                        this.output.warningVerticesString = "The number of darts for vertices is wrong!";
                        this.output.warningVerticesColor = '#CB4335';
                    }
                    else {
                        this.parseValue(this.inputVertices, this.dartsNumber, "vertices");
                        flag = true;
                    }
                    return flag;
                }
            },
            //Parse edges string
            parseEdges: function () {
                var edges = /^\{(\([0-9]+(,[0-9]+)\))(,\([0-9]+(,[0-9]+)\))*}$/;
                if (!this.inputEdges) {
                    this.output.warningEdgesString = 'Edges required!';
                    this.output.warningEdgesColor = '#CB4335';
                }
                else if (!edges.test(this.inputEdges)) {
                    this.output.warningEdgesString = 'The format of edges is error!(example:{(0,1),(2,3)})';
                    this.output.warningEdgesColor = '#CB4335';
                }
                else {
                    edgesArr = this.inputEdges.match(/\d+/g).map(Number);
                    var flag = false;
                    if (this.isRepeat(edgesArr)) {
                        this.output.warningEdgesString = "The index of darts in edges repeat!";
                        this.output.warningEdgesColor = '#CB4335';
                    }
                    else if (this.isOutOfRange(edgesArr)) {
                        this.output.warningEdgesString = "The index of darts in edges out of range!";
                        this.output.warningEdgesColor = '#CB4335';
                    }
                    else if (edgesArr.length != this.dartsNumber) {
                        this.output.warningEdgesString = "The number of darts for edges is wrong!";
                        this.output.warningEdgesColor = '#CB4335';
                    }
                    else {
                        this.parseValue(this.inputEdges, this.dartsNumber, "edges");
                        flag = true;
                    }
                    return flag;
                }
            },
            parseValue: function (value, dartsNumber, type) {
                if (type == "edges") {
                    v = /\([0-9]+(,[0-9]+)\)/g;
                    cycles = value.match(v).map((d) => {
                        elem = d.match(/\d+/g).map(Number);
                        return elem
                    });
                    this.output.edgesCyclesString = cycles;
                    this.output.edgesPermutationsString = this.convertToPermutations(cycles, dartsNumber);
                    this.output.warningEdgesColor = '#343a40';
                }
                else if (type == "vertices") {
                    v = /\([0-9]+(,[0-9]+)*\)/g;
                    cycles = value.match(v).map((d) => {
                        elem = d.match(/\d+/g).map(Number);
                        return elem
                    });
                    this.output.verticesCyclesString = cycles;
                    this.output.verticesPermutationsString = this.convertToPermutations(cycles, dartsNumber);
                    this.output.warningVerticesColor = '#343a40';
                }
            },
            //Whether the elements repeat
            isRepeat: function (arr) {
                var hash = {}
                for (var i in arr) {
                    if (hash[arr[i]]) {
                        return true;
                    }
                    hash[arr[i]] = true;
                }
                return false;
            },
            //Whether the element out of range
            isOutOfRange: function (arr) {
                for (var i in arr) {
                    if (arr[i] >= this.dartsNumber) {
                        return true;
                    }
                }
                return false;
            },
            //Convert cycles to permutation
            convertToPermutations: function (arr, num) {
                var permutations = new Array(num);
                for (var i in arr) {
                    var n = arr[i].length;
                    for (var j in arr[i]) {
                        if (j == n - 1) {
                            permutations[arr[i][j]] = arr[i][0];
                        }
                        else {
                            permutations[arr[i][j]] = arr[i][parseInt(j) + 1];
                        }
                    }
                }
                return permutations;
            },
            convertToCycles: function (perm, num) {
                darts = new Array(num).fill(0).map((v, i) => { return v + i; });
                cycles = new Array();
                cycle = new Array();
                i = 0;
                while (true) {
                    if (perm[i] == i) {
                        cycle.push(i);
                        cycles.push(cycle);
                        cycle = new Array();
                        idx = darts.indexOf(i);
                        darts.splice(idx, 1);
                        if (darts.length > 0) {
                            i = darts[0];
                        }
                        else {
                            break;
                        }
                    }
                    else {
                        cycle.push(i);
                        idx = darts.indexOf(i);
                        darts.splice(idx, 1);
                        if (cycle.indexOf(perm[i]) == -1) {
                            i = perm[i];
                        }
                        else {
                            cycles.push(cycle);
                            cycle = new Array();
                            if (darts.length > 0) {
                                i = darts[0];
                            }
                            else {
                                break;
                            }
                        }
                    }
                }
                console.log("c" + cycles);
                return cycles;
            },
            //Validate the connection
            isConnected: function (arr_v, arr_ep) {
                var nodes = new Array(arr_v.length).fill(0).map((v, i) => { return v + i; });
                var edges = new Array(arr_ep.length).fill(0).map((v, i) => { return v + i; });
                var route = [nodes.shift()];
                var path = new Array();
                var d_path = new Array();

                //generating the darts to nodes 
                var darts_nodes = new Array(arr_ep.length);
                for (var node in arr_v) {
                    for (var j in arr_v[node]) {
                        darts_nodes[arr_v[node][j]] = node;
                    }
                }

                //dfs
                while (nodes.length != 0 && edges.length != 0 && route.length != 0) {
                    // debugger;
                    start = route.pop();
                    // debugger;
                    //all edges of the nodes has been searched
                    if (arr_v[start].length == 0) {
                        continue;
                    }
                    //search for the new node
                    else {
                        route.push(start);
                        // debugger;
                        bridge_begin = arr_v[start].shift();
                        edges.splice(edges.indexOf(bridge_begin), 1);
                        bridge_end = arr_ep[bridge_begin];
                        edges.splice(edges.indexOf(bridge_end), 1);
                        end = parseInt(darts_nodes[bridge_end]);
                        arr_v[end].splice(arr_v[end].indexOf(bridge_end), 1)
                        idx_end = nodes.indexOf(end);
                        // debugger;
                        //the new node did not search
                        if (idx_end > -1) {
                            d_path.push([bridge_begin, bridge_end]);
                            path.push([start, end]);
                            route.push(end);
                            nodes.splice(idx_end, 1);
                        }
                    }
                }
                if (nodes.length == 0) {
                    return { res: true, vpath: path, dpath: d_path };
                }
                else {
                    return { res: false, vpath: null, dpath: null };
                }
            },
            validateTheConnection: function (arr_v, arr_ep) {
                result = this.isConnected(arr_v, arr_ep);
                if (result.res) {
                    this.output.isFacesShow = true;
                    this.ouput.warningFacesString = "";
                    this.output.spanningTreeString = result.vpath;
                    this.output.spanningTreePath = result.dpath;
                    return true;
                }
                else {
                    this.isFacesShow = false;
                    this.output.warningFacesString = "The combinatorial map is not connnected!";
                    this.output.warningFacesColor = "#CB4335";
                    return false;
                }
            },
            //Generate faces (cycles and permutations)
            //input vertices cycles
            genFaces: function (arr, dartsNumber) {
                //reverse vertices cycles
                for (var i in arr) {
                    if (arr[i].length > 1) {
                        head = arr[i].shift();
                        arr[i].reverse();
                        arr[i].unshift(head);
                    }
                }

                //generate faces cycles
                var faces = new Array();
                var darts = new Array(dartsNumber).fill(0).map((v, i) => { return v + i; })
                while (darts.length) {
                    face = new Array();
                    dart = darts.shift();
                    while (face.indexOf(dart) == -1) {
                        face.push(dart);
                        idx_dart = darts.indexOf(dart);
                        if (idx_dart > -1) {
                            darts.splice(idx_dart, 1);
                        }
                        bridge = this.output.edgesPermutationsString[dart];
                        for (var node in arr) {
                            idx_bridge = arr[node].indexOf(bridge);
                            if (idx_bridge > -1) {
                                if (idx_bridge == arr[node].length - 1) {
                                    dart = arr[node][0];
                                }
                                else {
                                    dart = arr[node][parseInt(idx_bridge) + 1]
                                }
                            }
                        }
                    }
                    faces.push(face)
                }
                this.output.facesCyclesString = faces;
                this.output.facesPermutationsString = this.convertToPermutations(faces, dartsNumber);
                this.output.faceNumber=this.ouput.facesCyclesString.length;
                this.output.verticesNumber=this.output.verticesCyclesString.length;
                this.output.dartsNumber = dartsNumber;
                cv = this.output.verticesCyclesString.length;
                ce = this.output.edgesCyclesString.length;
                cf = this.ouput.facesCyclesString.length;
                genusNumber = (2 - (cv - ce + cf)) / 2;
                this.ouput.genusNumber = genusNumber == 0 ? genusNumber + " (planar graph)" : genusNumber;
            },
            showInCanvas: function (svg, saveid, width = 350, height = 350) {
                var serializer = new XMLSerializer();
                var source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svg.node());
                var image = new Image();
                image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
                var canvas = document.getElementById(saveid);
                canvas.width = width;
                canvas.height = height;
                var context = canvas.getContext("2d");
                image.onload = function () {
                    context.drawImage(image, 0, 0, width, height);
                    //   var a = document.createElement("a");  
                    //   a.download = "name.png";  
                    //   a.href = canvas.toDataURL("image/png");  
                    //   a.click();  }
                    // canvas.appendChild(image);
                    canvas.toDataURL("img/svg", 1.0);
                }
            }
        }
    });
}