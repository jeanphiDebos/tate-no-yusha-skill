/*
 * not need look autoProvideVariables in webpack.config.js
 * const $ = require('jquery');
 */
/*
 * @todo reforge this app.js to use node d3
 * const d3 = require('d3');
 */

require('bootstrap-sass');
var d3 = require('d3');

$.ajaxSetup({
  contentType: "application/json; charset=utf-8"
});

// Highlight a skill in the graph. It is a closure within the d3.json() call.
var selectSkill = undefined;
// Change status of a panel from visible to hidden or viceversa
var toggleDiv = undefined;
// Clear all help boxes and select a skill in network and in skill details panel
var clearAndSelect = undefined;
// The call to set a zoom value -- currently unused (zoom is set via standard mouse-based zooming)

$(document).ready(function () {
    var graphArray = {'nodes' : [], 'links': []};
    var idUser = $('body').data('user-id');

    $.get('api/users/' + idUser + '/weapon', 'json').done(function (data) {
        graphArray.nodes.push({
            'id': data.id,
            'name': data.name,
            'type': 'arme',
            'label': data.name,
            'index': 0,
            'description': data.description,
            'image': data.image,
            'enable': true,
        });
        D3ok(idUser, graphArray);
    }).fail(function (data) {
      console.error("error: ajax get weapon for users: " + idUser);
    })
});

// Do the stuff -- to be called after D3.js has loaded
function D3ok(idUser, graphArray) {
    // Some constants
    var WIDTH = $('#panel-skill').width(),
        HEIGHT = $(window).height()-20,
        SHOW_THRESHOLD = 2.5;

    // Variables keeping graph state
    var activeSkill = undefined;
    var zoomCall = undefined;
    var currentOffset = { x: 0, y: 0 };
    var currentZoom = 1.5;
    var indexGraphArray = 1;

    // The D3.js scales
    var xScale = d3.scale.linear()
        .domain([0, WIDTH])
        .range([0, WIDTH]);
    var yScale = d3.scale.linear()
        .domain([0, HEIGHT])
        .range([0, HEIGHT]);
    var zoomScale = d3.scale.linear()
        .domain([1, 6])
        .range([1, 6])
        .clamp(true);

    /* .......................................................................... */

    // The D3.js force-directed layout
    var force = d3.layout.force()
        .charge(-320)
        .size([WIDTH, HEIGHT])
        .linkStrength(function (d, idx) { return d.weight; });

    // Add to the page the SVG element that will contain the skill network
    var svg = d3.select("#panel-skill").append("svg:svg")
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .attr("id", "graph")
        .attr("viewBox", "0 0 " + WIDTH + " " + HEIGHT)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Skill panel: the div into which the skill details info will be written
    skillInfoDiv = d3.select("#skillInfo");

    /* ....................................................................... */

    // Get the current size & offset of the browser's viewport window
    function getViewportSize(w) {
        var w = w || window;
        if (w.innerWidth != null)
            return {
                w: w.innerWidth,
                h: w.innerHeight,
                x: w.pageXOffset,
                y: w.pageYOffset
            };
        var d = w.document;
        if (document.compatMode == "CSS1Compat")
            return {
                w: d.documentElement.clientWidth,
                h: d.documentElement.clientHeight,
                x: d.documentElement.scrollLeft,
                y: d.documentElement.scrollTop
            };
        else
            return {
                w: d.body.clientWidth,
                h: d.body.clientHeight,
                x: d.body.scrollLeft,
                y: d.body.scrollTop
            };
    }

    /* ....................................................................... */

    function getQStringParameterByName(name) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    }

    /* Change status of a panel from visible to hidden or viceversa
       id: identifier of the div to change
       status: 'on' or 'off'. If not specified, the panel will toggle status
    */
    toggleDiv = function (id, status) {
        d = d3.select('div#' + id);
        if (status === undefined)
            status = d.attr('class') == 'panel_on' ? 'off' : 'on';
        d.attr('class', 'panel_' + status);
        return false;
    }

    /* Clear all help boxes and select a skill in the network and in the 
       skill details panel
    */
    clearAndSelect = function (id) {
        toggleDiv('faq', 'off');
        toggleDiv('help', 'off');
        selectSkill(id, true);	// we use here the selectSkill() closure
    }

    /* Compose the content for the panel with skill details.
       Parameters: the node data, and the array containing all nodes
    */
    function getSkillInfo(n, nodeArray) {
        $('#skill-info').modal();
        $('#skill-info-titre').empty().append(n.name);
        $('#skill-info-description').empty().append(n.description);
        $('#skill-info-image').attr('src', n.image);
        $('#skill-info-cost').empty().append(n.cost);
        if (n.type === 'arme') {
            $('#skill-info-cost').parent().hide();
        } else {
            $('#skill-info-cost').parent().show();
        }
    }

    function initGraphArray(array, finalArray, isChild) {
        array.forEach(function (element) {
            finalArray.nodes.push({
                'id': element.id,
                'type': 'skill',
                'label': element.name,
                'name': element.name,
                'index': indexGraphArray,
                'enable': element.enable,
                'description': element.description,
                'image': element.image,
                'cost': element.cost,
                'enable': element.enable,
            });
            finalArray.links.push({
                'source': isChild,
                'target': indexGraphArray,
                'weight': 1,
            });
            indexGraphArray++;
            if (element.childSkill) {
                finalArray = initGraphArray(element.childSkill, finalArray, indexGraphArray-1);
            }
        });

        return finalArray;
    }

    // *************************************************************************
    d3.json(
        'api/users/' + idUser + '/weapon/skills?skillParent%5Bexists%5D=false',
        function (data) {
            // Declare the variables pointing to the node & link arrays
            graphArray = initGraphArray(data, graphArray, 0);

            var nodeArray = graphArray.nodes;
            var linkArray = graphArray.links;

            minLinkWeight = Math.min.apply(null, linkArray.map(function (n) { return n.weight; }));
            maxLinkWeight = Math.max.apply(null, linkArray.map(function (n) { return n.weight; }));

            // Add the node & link arrays to the layout, and start it
            force
                .nodes(nodeArray)
                .links(linkArray)
                .start();

            // A couple of scales for node radius & edge width
            var node_size = d3.scale.linear()
                .domain([5, 10])	// we know score is in this domain
                .range([1, 16])
                .clamp(true);
            var edge_width = d3.scale.pow().exponent(8)
                .domain([minLinkWeight, maxLinkWeight])
                .range([5, 10])
                .clamp(true);

            /* Add drag & zoom behaviours */
            svg.call(d3.behavior.drag()
                .on("drag", dragmove));
            svg.call(d3.behavior.zoom()
                .x(xScale)
                .y(yScale)
                .scaleExtent([1, 6])
                .on("zoom", doZoom));

            // ------- Create the elements of the layout (links and nodes) ------
            var networkGraph = svg.append('svg:g').attr('class', 'grpParent');

            // links: simple lines
            var graphLinks = networkGraph.append('svg:g').attr('class', 'grp gLinks')
                .selectAll("line")
                .data(linkArray, function (d) { return d.source.id + '-' + d.target.id; })
                .enter().append("line")
                .style('stroke-width', function (d) { return edge_width(d.weight); })
                .attr("class", "link");

            // nodes: an SVG circle
            var graphNodes = networkGraph.append('svg:g').attr('class', 'grp gNodes')
                .selectAll("circle")
                .data(nodeArray, function (d) { return d.id; })
                .enter().append("svg:circle")
                .attr('id', function (d) { return "c" + d.index; })
                .attr('class', function (d) { return 'node ' + ((d.enable) ? 'enable' : 'disable'); })
                .attr('r', function (d) { return (d.type === 'arme') ? 24 : node_size(16); })
                .attr('pointer-events', 'all')  
                .on("click", function (d) { showSkillPanel(d); });

            // labels: a group with two SVG text: a title and a shadow (as background)
            var graphLabels = networkGraph.append('svg:g').attr('class', 'grp gLabel')
                .selectAll("g.label")
                .data(nodeArray, function (d) { return d.label })
                .enter().append("svg:g")
                .attr('id', function (d) { return "l" + d.index; })
                .attr('class', 'label');

            shadows = graphLabels.append('svg:text')
                .attr('x', '-2em')
                .attr('y', '-.3em')
                .attr('pointer-events', 'none') // they go to the circle beneath
                .attr('id', function (d) { return "lb" + d.index; })
                .attr('class', 'nshadow')
                .text(function (d) { return d.label; });

            labels = graphLabels.append('svg:text')
                .attr('x', '-2em')
                .attr('y', '-.3em')
                .attr('pointer-events', 'none') // they go to the circle beneath
                .attr('id', function (d) { return "lf" + d.index; })
                .attr('class', 'nlabel')
                .text(function (d) { return d.label; });


            /* --------------------------------------------------------------------- */
            /* Select/unselect a node in the network graph.
               Parameters are: 
               - node: data for the node to be changed,  
               - on: true/false to show/hide the node
            */
            function highlightGraphNode(node, on) {
                //if( d3.event.shiftKey ) on = false; // for debugging

                // If we are to activate a skill, and there's already one active,
                // first switch that one off
                if (on && activeSkill !== undefined) {
                    highlightGraphNode(nodeArray[activeSkill], false);
                }

                // locate the SVG nodes: circle & label group
                circle = d3.select('#c' + node.index);
                label = d3.select('#l' + node.index);

                // activate/deactivate the node itself
                circle.classed('main', on);
                label.classed('on', on);
                label.selectAll('text').classed('main', on);

                // set the value for the current active skill
                activeSkill = on ? node.index : undefined;
            }


            /* --------------------------------------------------------------------- */
            /* Show the details panel for a skill AND highlight its node in 
               the graph. Also called from outside the d3.json context.
               Parameters:
               - new_idx: index of the skill to show
               - doMoveTo: boolean to indicate if the graph should be centered
                 on the skill
            */
            selectSkill = function (new_idx, doMoveTo) {
                // do we want to center the graph on the node?
                doMoveTo = doMoveTo || false;
                if (doMoveTo) {
                    s = getViewportSize();
                    width = s.w < WIDTH ? s.w : WIDTH;
                    height = s.h < HEIGHT ? s.h : HEIGHT;
                    offset = {
                        x: s.x + width / 2 - nodeArray[new_idx].x * currentZoom,
                        y: s.y + height / 2 - nodeArray[new_idx].y * currentZoom
                    };
                    repositionGraph(offset, undefined, 'move');
                }
                // Now highlight the graph node and show its skill panel
                highlightGraphNode(nodeArray[new_idx], true);
                showSkillPanel(nodeArray[new_idx]);
            }


            /* --------------------------------------------------------------------- */
            /* Show the skill details panel for a given node
             */
            function showSkillPanel(node) {
                getSkillInfo(node, nodeArray);
            }


            /* --------------------------------------------------------------------- */
            /* Move all graph elements to its new positions. Triggered:
               - on node repositioning (as result of a force-directed iteration)
               - on translations (user is panning)
               - on zoom changes (user is zooming)
               - on explicit node highlight (user clicks in a skill panel link)
               Set also the values keeping track of current offset & zoom values
            */
            function repositionGraph(off, z, mode) {
                // do we want to do a transition?
                var doTr = (mode == 'move');

                // drag: translate to new offset
                if (off !== undefined &&
                    (off.x != currentOffset.x || off.y != currentOffset.y)) {
                    g = d3.select('g.grpParent')
                    if (doTr)
                        g = g.transition().duration(500);
                    g.attr("transform", function (d) {
                        return "translate(" +
                            off.x + "," + off.y + ")"
                    });
                    currentOffset.x = off.x;
                    currentOffset.y = off.y;
                }

                // zoom: get new value of zoom
                if (z === undefined) {
                    if (mode != 'tick')
                        return;	// no zoom, no tick, we don't need to go further
                    z = currentZoom;
                }
                else
                    currentZoom = z;

                // move edges
                e = doTr ? graphLinks.transition().duration(500) : graphLinks;
                e
                    .attr("x1", function (d) { return z * (d.source.x); })
                    .attr("y1", function (d) { return z * (d.source.y); })
                    .attr("x2", function (d) { return z * (d.target.x); })
                    .attr("y2", function (d) { return z * (d.target.y); });

                // move nodes
                n = doTr ? graphNodes.transition().duration(500) : graphNodes;
                n
                    .attr("transform", function (d) {
                        return "translate("
                            + z * d.x + "," + z * d.y + ")"
                    });
                // move labels
                l = doTr ? graphLabels.transition().duration(500) : graphLabels;
                l
                    .attr("transform", function (d) {
                        return "translate("
                            + z * d.x + "," + z * d.y + ")"
                    });
            }


            /* --------------------------------------------------------------------- */
            /* Perform drag
             */
            function dragmove(d) {
                offset = {
                    x: currentOffset.x + d3.event.dx,
                    y: currentOffset.y + d3.event.dy
                };
                repositionGraph(offset, undefined, 'drag');
            }


            /* --------------------------------------------------------------------- */
            /* Perform zoom. We do "semantic zoom", not geometric zoom
             * (i.e. nodes do not change size, but get spread out or stretched
             * together as zoom changes)
             */
            function doZoom(increment) {
                newZoom = increment === undefined ? d3.event.scale
                    : zoomScale(currentZoom + increment);
                if (currentZoom == newZoom)
                    return;	// no zoom change

                // See what is the current graph window size
                s = getViewportSize();
                width = s.w < WIDTH ? s.w : WIDTH;
                height = s.h < HEIGHT ? s.h : HEIGHT;

                // Compute the new offset, so that the graph center does not move
                zoomRatio = newZoom / currentZoom;
                newOffset = {
                    x: currentOffset.x * zoomRatio + width / 2 * (1 - zoomRatio),
                    y: currentOffset.y * zoomRatio + height / 2 * (1 - zoomRatio)
                };

                // Reposition the graph
                repositionGraph(newOffset, newZoom, "zoom");
            }

            /* --------------------------------------------------------------------- */

            $("#zoom").click(function() {
                doZoom(0.5);
            });

            $("#unzoom").click(function() {
                doZoom(-0.5);
            });

            /* process events from the force-directed graph */
            force.on("tick", function () {
                repositionGraph(undefined, undefined, 'tick');
            });

            /* A small hack to start the graph with a skill pre-selected */
            mid = getQStringParameterByName('id')
            if (mid != null) {
                clearAndSelect(mid);
            }

            setTimeout(function() {
                s = getViewportSize();
                width = s.w < WIDTH ? s.w : WIDTH;
                height = s.h < HEIGHT ? s.h : HEIGHT;
                offset = {
                    x: s.x + width / 2 - nodeArray[0].x * currentZoom,
                    y: s.y + height / 2 - nodeArray[0].y * currentZoom
                };
                repositionGraph(offset, undefined, 'move');
                highlightGraphNode(nodeArray[0], true);
                svg.selectAll("g.label").classed('on', true);
            }, 2000);
        }
    );
}