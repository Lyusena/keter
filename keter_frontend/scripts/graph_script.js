/* 
Тестирование работоспособности
1. Отображение ноды:
    - отображается введенное количество инпутов
    - отображается введенное количество отпутов
    - верно отображается название ноды
2. Соединение оутпут->инпут
    - 2.1 нажатие на кружочек - он увеличивается
    - 2.2 нажатие на другой кружочек - предыдущий нажатый уменьшается, а нажатый увеличивается
    - в рамках одной ноды тоже должно работать!!!

    вариант1: всего 1 нода, 
    соединение своего отпута с инпутом : ОР - связи не появляются + 2.1 + 2.2

    вариант2: 2 ноды,
    зацикливание нода2оутпут - нода1инпут 
        есть связи
        нет связей


БАГ1: 
    -не уменьшается кружочек в рамках одной ноды: инпут-оутпут
    -есть связь инп - отпут, нажимаешь на инпут и подсвечены предыдущ нажатый output тоже. - не выполняются 2.1 2.2
БАГ3:
    -вариант1: всего 1 нода, соединение своего отпута с инпутом - не выполняются 2.1 и 2.2

ЗАДАЧИ:
    1.Удаление связей
    
*/


var holder = document.getElementById('holder');
var btn_done = document.getElementById('btn_done');
var btn_delete = document.getElementById('btn_delete');
var btn_get = document.getElementById('btn_get');

var r = Raphael("holder", 640, 600);

var connections = {};
var all_input_connectors = {};
var all_ouput_connectors = {};

var map = new Map();
var all_inputs=[];
var all_outputs = [];

var inp_clicked = null;
var output_clicked = null;

var isEmptyObject = function (obj) { return Object.keys(obj).length=== 0; };

Raphael.fn.connection = function (from, to, color) {
    var fromKey = getConnectorKey(from.rect_id, from.idx);
    var toKey = getConnectorKey(to.rect_id, to.idx);
    console.log(fromKey + " " + toKey)
    if(typeof(connections[fromKey]) != "undefined" && typeof(connections[fromKey][toKey]) != "undefined" && connections[fromKey][toKey] != 0)
        return;
    if(typeof(connections[fromKey]) == "undefined") 
        connections[fromKey] = {};
    if(typeof(connections[toKey]) == "undefined")
        connections[toKey] = {};
    if(from.rect_id == to.rect_id)
        //|| from.rect_id > to.rect_id ) FIX IT!!!! зацикливание
        return;
    

    var lineCode = "M" + Math.floor(from.attr("cx")) + " " + Math.floor(from.attr("cy")) + "L" + Math.floor(to.attr("cx")) + " " + Math.floor(to.attr("cy"));
    var line = r.path(lineCode);
    connections[fromKey][toKey] = line;
    connections[toKey][fromKey] = line;
    line.attr({stroke: color, fill: "none", 'stroke-width':3,'arrow-end':'block-midium-midium'}); 

};

var getConnectorKey = function(rect_id, connector_id) {
    return rect_id + ":" + connector_id;
}

var connect = function(){
    if(inp_clicked != null && output_clicked != null) {
        all_inputs[all_inputs.length] = inp_clicked;
        all_outputs[all_outputs.length] = output_clicked;
        map.set(inp_clicked, output_clicked);
        r.connection(output_clicked, inp_clicked, "#fff");
        inp_clicked.animate({"stroke-width": 5.0}, 100);
        output_clicked.animate({"stroke-width": 1.0}, 100); 
        console.log("CONNECT")    
    }

}

var cancelAnimInpOutput = function(){
    if(inp_clicked != null){
        inp_clicked.animate({"stroke-width": 1}, 100);
        inp_clicked = null;
    }
}

var dragNode = function(collection) { 
    return function () {
        for(var i = 0; i < collection.length; i++) {
            var elem = collection[i];
            if(elem.type == "ellipse"){
                elem.ox = elem.attr("cx");
                elem.oy = elem.attr("cy");
            } else {
                elem.ox = elem.attr("x");
                elem.oy = elem.attr("y");
            }
        }

        this.animate({"fill-opacity": 1.0}, 500);
    };
};

var moveNode = function(collection) { 
    return function (dx, dy) {
        for(var i = 0; i < collection.length; i++) {
            var elem = collection[i];

            if(elem.type == "ellipse"){
                elem.attr({cx: elem.ox + dx, cy: elem.oy + dy});
                moveConnections(elem.rect_id, elem.idx);
            } else {
                elem.attr({x: elem.ox + dx, y: elem.oy + dy});
            }
        }
    };
};

var findAnotherEnd = function(rect_id, connector_id){
    var conn_key = getConnectorKey(rect_id, connector_id);
    if(typeof(connections[conn_key]) == "undefined") 
        return; //эта вершина никогда коннектилась
    var connectorsFromOtherEnd = connections[conn_key];
    
    for(var otherEndId in connectorsFromOtherEnd) {
        let corrLine = connections[conn_key][otherEndId];
        return corrLine;
    }
}

var moveConnections = function(rect_id, connector_id) {
    var conn_key = getConnectorKey(rect_id, connector_id);
    if(typeof(connections[conn_key]) == "undefined") 
        return; //эта вершина никогда коннектилась
    var connectorsFromOtherEnd = connections[conn_key];
    
    for(var otherEndId in connectorsFromOtherEnd) {
        var corrLine = connections[conn_key][otherEndId];

        if(typeof(corrLine) != "undefined" && corrLine != 0) {
            //var xStartCoorLine = corrLine.attr('path')[0][1];
            //var yStartCoorLine = corrLine.attr('path')[0][2];
            // corrLine.attr('path')[0][1] = inp_clicked.attr("cx");
            // corrLine.attr('path')[0][2] = inp_clicked.attr("cy");
            // corrLine.attr('path')[1][1] = output_clicked.attr("cx");
            // corrLine.attr('path')[1][2] = output_clicked.attr("cy");
            corrLine.remove();
            	 connections[conn_key][otherEndId] = 0;
            	 connections[otherEndId][conn_key] = 0;            
        } 
    }
    map.forEach( (value, key, map) => { 
     	r.connection(value, key, "#fff");
 	});
 }

var upNode  = function(collection) { 
    return function () {
           this.animate({"fill-opacity": 0}, 500);
    };
}

var inpClick = function(rec, rect_id, index) { 
    return function(e) {
        if(inp_clicked == null){
            this.animate({"stroke-width": 5.0}, 100);
            inp_clicked = this;

        } else {
            inp_clicked.animate({"stroke-width": 1}, 100);
            this.animate({"stroke-width": 5.0}, 100);
            inp_clicked = this;
        } 
        let output_key = getConnectorKey(output_clicked.rect_id, output_clicked.idx);
        let input_key = getConnectorKey(inp_clicked.rect_id, inp_clicked.idx);
        console.log(isEmptyObject(connections))


        //console.log(output_key) 
        if(isEmptyObject(connections)){
            connect();
            //output_clicked = null;
        } else if (typeof(connections[output_key]) == "undefined"){
            connect();
            output_clicked = null;
            console.log("dddddddddd")

        }
        console.log(all_outputs[0].idx) /*else alert("connection already exist! You couldn't add more connections to one input")
        console.log(output_key + " " + input_key+  connections[output_key][input_key])*/
    }
}

var outputClick = function(rect_id, index) { 
    return function(e) {
        if(output_clicked==null){
            this.animate({"stroke-width": 5.0}, 100);
            output_clicked = this;
        } else {
            output_clicked.animate({"stroke-width": 1}, 100);
            this.animate({"stroke-width": 5.0}, 100);
            output_clicked = this;
        }
        //console.log(output_clicked)
         //console.warn(rect_id + " " + index+ " " + connections[getConnectorKey(rect_id, index)])
    }
}

var rect_id = 0;
var add_elem = function (cx, cy, inputs_count, outputs_count, node_name) {
    let WIDTH = 60;
    let HEIGHT = 80; 
    let rec = r.rect(cx - WIDTH / 2, cy - HEIGHT / 2, WIDTH, HEIGHT, 10);
    rect_id = rect_id + 1;
    let recColor = Raphael.getColor();    
    rec.attr({fill: recColor, stroke: recColor, "fill-opacity": 0, "stroke-width": 2, cursor: "move"});
    rec.rect_id=rect_id;
    let col = [rec];
    rec.drag(moveNode(col), dragNode(col), upNode(col));
    
    let inpColor = Raphael.getColor();    
    for(var i = 0; i < inputs_count; i++) {
        let heightDelta = HEIGHT / (inputs_count + 1);
    
        let elem = r.ellipse(cx - WIDTH / 2, cy - HEIGHT / 2 + heightDelta * (i + 1), 5, 5);
        elem.idx = i;
        elem.rect_id = rect_id;
        
        elem.attr({fill: inpColor, stroke: inpColor, "fill-opacity": 1.0, "stroke-width": 2, cursor: "move"});
        elem.click(inpClick(rec, rec.rect_id, i));
        let inpName = r.text(cx - WIDTH / 2, cy - HEIGHT / 2 + heightDelta * (i + 1), i).attr({fill: "#fff"});
        col.push(elem);
        col.push(inpName)
    }

    let outColor = Raphael.getColor();
    if(outputs_count <= 6){
        for(var i = 0; i < outputs_count; i++) {
            let heightDelta = HEIGHT / (outputs_count + 1);
            let elem = r.ellipse(cx + WIDTH / 2, cy - HEIGHT / 2 + heightDelta * (i + 1), 5, 5);
            elem.idx = i;
            elem.rect_id = rect_id;
           
            elem.attr({fill: outColor, stroke: outColor, "fill-opacity": 1.0, "stroke-width": 2, cursor: "move"});
            elem.click(outputClick(rec.rect_id, i));
            let outputName = r.text(cx + WIDTH / 2, cy - HEIGHT / 2 + heightDelta * (i + 1), i).attr({fill: "#fff"});
            col.push(elem); 
            col.push(outputName)
        }
    } else {
        let groupOutputs = r.ellipse(cx + WIDTH / 2, cy, 3, 30);
        groupOutputs.attr({fill: outColor, stroke: outColor, "fill-opacity": 0.9, "stroke-width": 2, cursor: "move"}); 
        let allOutputsInGroup = r.rect(cx + WIDTH/2+10, cy - HEIGHT / 2, 40, HEIGHT, 10);  
        allOutputsInGroup.attr({fill: "green", stroke: "white", "fill-opacity": 0, "stroke-width": 2, cursor: "move"});
      
         
        groupOutputs.node.onmouseover = function() {
            groupOutputs.attr("fill", "blue");
            groupingPins("output", outputs_count, outColor, rec, HEIGHT, WIDTH, cx, cy, col).show();
            allOutputsInGroup.show();
        };
        groupOutputs.node.onmouseout = function() {
            groupOutputs.attr("fill", outColor);
            allOutputsInGroup.hide();
        };
        col.push(allOutputsInGroup);
        col.push(groupOutputs); 
    }   
    
    let nodeName = r.text(cx, cy, node_name+rect_id).attr({fill: "#fff"});
    col.push(nodeName);
    
};

var groupingPins = function(pinsType, pinsCount, outColor, rec, HEIGHT_node, WIDTH_node, cx, cy, col){
    if(pinsType == "output"){
        for(var i = 0; i < pinsCount; i++) {
            let heightDelta = 2*pinsCount;// / (pinsCount + 1);
            let elem = r.ellipse(cx + WIDTH_node / 2 +10, cy - HEIGHT_node / 2 + heightDelta * (i + 1), 5, 5);
            elem.idx = i;
            elem.rect_id = rect_id;
           
            elem.attr({fill: outColor, stroke: outColor, "fill-opacity": 1.0, "stroke-width": 2, cursor: "move"});
            elem.click(outputClick(rec.rect_id, i));
            let outputName = r.text(cx + WIDTH_node / 2+20, cy - HEIGHT_node / 2 + heightDelta * (i + 1), i).attr({fill: "#fff"});
            col.push(elem); 
            col.push(outputName)
        }
    }
} 

/*var testCreateManyNodes = function(x0, y0, numNodes, numInputs, numOutputs){
    for(var i=0; i<numNodes; i++){
        node_name = "node ";
        inputs = parseInt(numInputs);
        outputs = parseInt(numOutputs);
        add_elem(x0+i*100, y0, inputs, outputs, node_name);
    }
}*/

btn_done.onclick = function(){
    var node_name_from_user = document.add_node.node_name.value;
    var inputs_count_from_user = parseInt(document.add_node.node_num_input.value);
    var outputs_count_from_user = parseInt(document.add_node.node_num_output.value);
    //add_elem(290, 80, inputs_count_from_user, outputs_count_from_user, node_name_from_user);
    add_elem(290, 80, 1, 8, "1");
    //testCreateManyNodes(100,100, 1, 5, 5);
};

