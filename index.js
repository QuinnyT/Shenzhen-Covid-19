
var mapChart = echarts.init(document.getElementById('main'));
var statsChart = echarts.init(document.getElementById('statsChart'));
var scatterData = [];
var linesData = [];

var myGeo = new BMap.Geocoder();


var pointData;
var selectedPoints = [];
let index = 0;

var sumList = [];
const colorList = [
  "#96bdd5", 
  "#b8d7b3", 
  "#F5B77C", 
  "#F38B8B"
]

const tooltip = d3.select('#tooltip')

$.getJSON("./data/dataNewWithLnglat.json", (points) => {
  // console.log("res", res);
  pointData = points;

  svgControl();

  pointData.map(function (item) {

    var thisColor;
    if (item.nld == "61及以上") {
      thisColor = colorList[0];
    } else if (item.nld == "36-60") {
      thisColor = colorList[1];
    } else if (item.nld == "15-35") {
      thisColor = colorList[2];
    } else if (item.nld == "14及以下") {
      thisColor = colorList[3];
    }
    item.thisColor = thisColor;
  })


  setStatsChart(pointData);

  $.getJSON("./data/map/DiySZmap2.json", (boundary) => {
    console.log("boundary", boundary);

    boundary.features.map(function (item) {
      var coords = item.geometry.coordinates[0][0];

      var converseCoords = coords.map(function (thisCoord) {
        var coord = coordtransform.gcj02tobd09(thisCoord[0], thisCoord[1]);
        return coord;
      })

      linesData.push({
        coords: converseCoords,
      })

    })

    setMapChart(boundary);
  })

})


// 地图
function setMapChart(boundary) {

  echarts.registerMap('SZ', boundary);

  var regions = getRegions(groupData(pointData, "只区分行政区"));

  mapChart.setOption(
    (option = {
      tooltip: {
        show: true
      },
      geo: {
        map: 'SZ',
        itemStyle: {
          areaColor: '#1F1F20',
          borderColor: "#3A3A3A",
          borderWidth: 1,
        },
        center: [114.1357731159577, 22.57424971755734],
        zoom: 0.8,
        roam: true,
        label: {
          show: true,
          color: 'rgba(255, 255, 255, 0.6)',
          fontWeight: 'lighter',
          fontSize: 10
        },
        emphasis: {
          disabled: true
        },
        tooltip: {
          show: true,
          backgroundColor: "rgba(0 ,0, 0, 0.8)",
          textStyle: {
            color: "#fff"
          },
          formatter: function (params) {
            // console.log("params", params)
            var thisValue = sumList.find(item => item.name == params.name);
            if (thisValue) {
              // console.log("thisValue", thisValue)
              return thisValue.name + "：" + thisValue.value
            }
          }
        },
        regions: regions
      },
      legend: {
        show: false,
        zlevel: 999,
        left: 50,
        top: 50,
        icon: 'circle',
      },
      dataset: {
        source: pointData,
      },
      series: [{
        type: 'scatter',
        coordinateSystem: 'geo',
        name: "选中的点",
        // datasetIndex: 0,
        encode: {
          // seriesName: "fbyf",
          lng: 'lng',
          lat: 'lat'
        },
        symbolSize: 4,
        itemStyle: {
          color: function (params) {
            // console.log("params", params)
            return params.data.thisColor
            // return val[2]
          },
          // borderColor: function (params) {
          //   // console.log("params", params)
          //   return params.data.thisBoderColor
          //   // return val[2]
          // },
          opacity: 0.6,
        },
        tooltip: {
          show: false,
        },
      }, ]
    })
  );

}

function resetMapChart() {
  var option = mapChart.getOption();
  // console.log("mapOption", option)
  var regions = getRegions(groupData(selectedPoints, "只区分行政区"));
  // console.log("regions", regions)

  option.dataset[0].source = selectedPoints;
  option.geo[0].regions = regions;
  mapChart.setOption(option);
}

function getRegions(regionList) {
  var allRegions = ["光明区", "南山区", "坪山区", "宝安区", "盐田区", "福田区", "罗湖区", "龙华区", "龙岗区"]
  return allRegions.map(function (region) {
    var regionIndex = regionList.findIndex(item => item.xzq == region)
    if (regionIndex != -1) {
      return {
        name: region,
        itemStyle: {
          areaColor: '#3A3A3A',
          borderColor: "#1F1F20",
          // areaColor: '#3A3A3A',
        }
        // tooltip: {
        //   show: true,
        //   formatter: '{c}'
        // }
      }
    } else {
      return {
        name: region,
        itemStyle: {
          areaColor: '#1F1F20',
          borderColor: "#3A3A3A",
          // areaColor: '#1F1F20',
        }
      }
    }

  })
}


// 柱状图
function setStatsChart() {

  console.log("pointData", pointData)
  // var newPointData = groupData( pointData );
  // console.log("newPointData", newPointData)

  var {
    nldData,
    customData
  } = getStatsData(groupData(pointData))
  console.log("nldData", nldData);
  console.log("customData", customData);

  sumList = [];

  statsChart.setOption(
    (option = {
      yAxis: {
        type: 'category',
        inverse: true,
        // data: ["罗湖区", "宝安区", "光明区", "福田区", "龙岗区", "南山区", "龙华区", "盐田区", "坪山区"],
        data: ["光明区", "南山区", "坪山区", "宝安区", "盐田区", "福田区", "罗湖区", "龙华区", "龙岗区"],
        axisLine: {
          show: false,
        },
        axisLabel: {
          show: false,
          inside: true
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
      xAxis: {
        type: 'value',
        inverse: true,
        min: 0,
        max: 280,
        axisLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false
        },
      },
      // tooltip: {
      //   show: true,
      //   formatter: '{c}'
      // },
      legend: {
        show: false,
        zlevel: 999,
        left: 50,
        top: 50,
        data: ["14及以下", "15-35", "36-60", "61及以上"],
        // selected: {
        //   '一月': true,
        //   '二月': false,
        //   '三月': false,
        // }
      },
      series: [{
          type: 'bar',
          name: "14及以下",
          data: nldData[0],
          barMinHeight: 2,
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              position: 'right',
              color: "#fff",
            }
          }
        },
        {
          type: 'bar',
          name: "15-35",
          data: nldData[1],
          barMinHeight: 2,
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              position: 'right',
              color: "#fff",
            }
          }
        },
        {
          type: 'bar',
          name: "36-60",
          data: nldData[2],
          barMinHeight: 2,
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              position: 'right',
              color: "#fff",
            }
          }
        },
        {
          type: 'bar',
          name: "61及以上",
          data: nldData[3],
          barMinHeight: 2,
          barGap: '0',
          barCategoryGap: '30%',
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              position: 'right',
              color: "#fff",
            }
          }
        },
        {
          type: 'custom',
          name: 'sum',
          renderItem: function (params, api) {
            // console.log("params", params)
            // console.log("api", api.value(0))
            var yValue = api.value(0);

            var currentSeriesIndices = api.currentSeriesIndices();
            var barLayout = api.barLayout({
              barGap: '0',
              barCategoryGap: '30%',
              count: currentSeriesIndices.length - 1
            });
            // console.log("currentSeriesIndices", currentSeriesIndices)
            var points = [];

            var allValueArr = [api.value(1), api.value(2), api.value(3), api.value(4)];
            var maxValue = Math.max(...allValueArr);

            for (var i = 0; i < currentSeriesIndices.length; i++) {
              var seriesIndex = currentSeriesIndices[i];
              // console.log("seriesIndex", seriesIndex)

              if (seriesIndex !== 0) {
                if (seriesIndex == 1) {
                  var point = api.coord([maxValue, yValue]);
                  point[0] -= 15;
                  point[1] += barLayout[i - 1].offsetCenter;
                  points.push(point);
                  points.push([point[0] - 5, point[1]])
                } else if (seriesIndex == 4) {
                  var point = api.coord([maxValue, yValue]);
                  point[0] -= 15;
                  point[1] += barLayout[i - 1].offsetCenter;
                  points.push([point[0] - 5, point[1]])
                  points.push(point);
                } else {
                  var point = api.coord([maxValue, yValue]);
                  point[0] -= 20;
                  point[1] += barLayout[i - 1].offsetCenter;
                  points.push(point);
                }
              }

            }
            // console.log("points", points)
            return {
              type: 'polyline',
              shape: {
                points: points
              },
              style: api.style({
                // stroke: api.visual('color'),
                stroke: "#ccc",
                fill: 'none'
              })
            };
          },
          label: {
            show: true,
            position: 'left',
            formatter: function (params) {
              // console.log("params", params)
              var sum = 0;
              for (let i = 1; i < 5; i++) {
                sum += params.data[i]
              }
              // console.log("sum", sum)
              sumList.push({
                name: params.name,
                value: sum
              })
              return sum
            },
            color: '#fff',
            fontSize: 13
          },
          data: customData,
          encode: {
            x: [1, 2, 3, 4],
            y: 0
          },
          universalTransition: {
            enabled: true
          }
        },
      ]
    })
  );

  console.log("sumList", sumList)
}

function resetStatsChart() {
  sumList = [];

  var option = statsChart.getOption();
  // console.log("statsOption", option)
  // var newPointData = groupData(selectedPoints);
  var {
    nldData,
    customData
  } = getStatsData(groupData(selectedPoints))

  for (let i = 0; i < 4; i++) {
    option.series[i].data = nldData[i]
  }
  option.series[4].data = customData;

  statsChart.setOption(option);

}

function getStatsData(newPointData) {
  console.log("newPointData", newPointData)
  var nldData = [
    [],
    [],
    [],
    [],
  ];
  var customData = [];
  newPointData.map(function (item, index) {
    // var data = item.dataList.filter(item => item.nld == "14及以下")
    customData[index] = Array(5);
    customData[index][0] = item.xzq;

    var nldGroup1 = item.dataList.filter(item => item.nld == "14及以下");
    var nldGroup2 = item.dataList.filter(item => item.nld == "15-35");
    var nldGroup3 = item.dataList.filter(item => item.nld == "36-60");
    var nldGroup4 = item.dataList.filter(item => item.nld == "61及以上");

    if (nldGroup1.length > 0) {
      nldData[0].push({
        // value: [item.xzq, data[0].dataList.length],
        value: [nldGroup1[0].dataList.length, item.xzq],
        itemStyle: {
          color: colorList[0],
        },
      });
      customData[index][1] = nldGroup1[0].dataList.length;
    } else customData[index][1] = 0;

    if (nldGroup2.length > 0) {
      nldData[1].push({
        // value: [item.xzq, data[0].dataList.length],
        value: [nldGroup2[0].dataList.length, item.xzq],
        itemStyle: {
          color: colorList[1],
        },
      });
      customData[index][2] = nldGroup2[0].dataList.length;
    } else customData[index][2] = 0;

    if (nldGroup3.length > 0) {
      nldData[2].push({
        // value: [item.xzq, data[0].dataList.length],
        value: [nldGroup3[0].dataList.length, item.xzq],
        itemStyle: {
          color: colorList[2],
        },
      });
      customData[index][3] = nldGroup3[0].dataList.length;
    } else customData[index][3] = 0;

    if (nldGroup4.length > 0) {
      nldData[3].push({
        // value: [item.xzq, data[0].dataList.length],
        value: [nldGroup4[0].dataList.length, item.xzq],
        itemStyle: {
          color: colorList[3],
        },
      });
      customData[index][4] = nldGroup4[0].dataList.length;
    } else customData[index][4] = 0;

  })
  return {
    nldData,
    customData
  }
}


// Group Data
function groupData(thisPointsData, type) {

  var xzqGroup = [];
  thisPointsData.map(function (eachItem) {
    var xzqIndex = xzqGroup.findIndex(function (newItem) {
      return newItem.xzq === eachItem.xzq
    });
    if (xzqIndex == -1) {
      xzqGroup.push({
        xzq: eachItem.xzq,
        dataList: [eachItem]
      })
    } else {
      xzqGroup[xzqIndex].dataList.push(eachItem)
    }
  })
  if (type == "只区分行政区") {
    return xzqGroup
  }
  for (let i = 0; i < xzqGroup.length; i++) {
    var nldGroup = [];
    xzqGroup[i].dataList.map(function (eachItem) {
      var nldIndex = nldGroup.findIndex(function (newItem) {
        return newItem.nld === eachItem.nld
      });
      if (nldIndex == -1) {
        nldGroup.push({
          nld: eachItem.nld,
          dataList: [eachItem]
        })
      } else {
        nldGroup[nldIndex].dataList.push(eachItem)
      }
    })
    xzqGroup[i].dataList = nldGroup;
  }

  return xzqGroup;


}


// svg-蜜蜂图 brush
function svgControl() {

  d3.select('#mysvg').on('load', function () {

    const item = this;
    const canvas = item.contentDocument.querySelector('svg');

    console.log(item, canvas)
    console.log("canvasSize", canvas.getBoundingClientRect())

    var lineStart = item.contentDocument.querySelector("#图层_1 .cls-39").getAttribute("x1")
    var lineEnd = item.contentDocument.querySelector("#图层_1 .cls-39").getAttribute("x2")

    var myBrush = d3.brushX()
      .extent([
        [lineStart, 0],
        [lineEnd, canvas.viewBox.baseVal.height - 100]
      ])
      .on("start brush end", brushed)

    d3.select(canvas).append("g")
      .attr("class", "brush")
      .call(myBrush)
    // .call(myBrush.move, [83, 1556])

    setTimeout(() => {
      d3.select(canvas).select(".brush").call(myBrush.move, [lineStart, lineEnd]);
    }, 1000);

    var selectArea = item.contentDocument.querySelector(".brush .selection");
    selectArea.style.fill = "rgba(105, 105, 105, 0.2)";
    selectArea.style.borderTop = "2px solid #fff";

    selectArea.setAttribute("stroke", "none")

    var leftHandle = item.contentDocument.querySelector(".brush .handle--w");
    var rightHandle = item.contentDocument.querySelector(".brush .handle--e");

    // console.log("leftHandle style", leftHandle.style)

    leftHandle.setAttribute("x", lineStart);
    
    leftHandle.style.width = 20;
    
    leftHandle.style.fill = "none"

    rightHandle.setAttribute("x", lineEnd);
    
    rightHandle.style.width = 20;
    
    rightHandle.style.fill = "none";


    var leftCircle = d3.select(canvas).select(".brush").append("ellipse")
                     .attr("id", "leftCircle")
                     .attr('cx', leftHandle.getAttribute("x") - 20)
                     .attr('cy', leftHandle.getAttribute("y") - 30)
                     .attr('rx', "20")
                     .attr('ry', "20")
                     .style('fill', "#8C8C8C")
                     .style('stroke', "#8C8C8C")
                     .style('stroke-width', "4px")
    var rightCircle = d3.select(canvas).select(".brush").append("ellipse")
                     .attr("id", "rightCircle")
                     .attr('cx', rightHandle.getAttribute("x") + 20)
                     .attr('cy', rightHandle.getAttribute("y") - 30)
                     .attr('rx', "20")
                     .attr('ry', "20")
                     .style('fill', "#8C8C8C")
                     .style('stroke', "#8C8C8C")
                     .style('stroke-width', "4px")
    var baseLine = d3.select(canvas).select(".brush").append("rect")
                    .attr("x", lineStart)
                    .attr("y", leftHandle.getAttribute("y") - 35)
                    .style('width', lineEnd - lineStart)
                    .style('height', "10px")
                    .style('fill', "none")
                    .style('stroke', "#8C8C8C")
                    .style('stroke-width', "2px")
                    .style('rx', "5")
                    .style('ry', "5")
    var selectionLine = d3.select(canvas).select(".brush").append("line")
                          .attr("x1", leftHandle.getAttribute("x") + 20)
                          .attr("y1", leftHandle.getAttribute("y") - 30)
                          .attr("x2", rightHandle.getAttribute("x") - 20)
                          .attr("y2", rightHandle.getAttribute("y") - 30)
                          .style('stroke', "#8C8C8C")
                          .style('stroke-width', "10px")



    var startBox = d3.select(canvas).select(".brush").append("text")
      // .attr('x', leftHandle.getAttribute("x") - 120)
      .attr('y', leftHandle.getAttribute("y") - 65)
      // .attr('text', "124")
      .attr('fill', "#fff")
      .style('width', "100px")
      .style('height', "50px")
      .style("font-size", 28)

    var endBox = d3.select(canvas).select(".brush").append("text")
      // .attr('x', rightHandle.getAttribute("x") + 20)
      .attr('y', rightHandle.getAttribute("y") - 65)
      // .attr('text', "124")
      .attr('fill', "#fff")
      .style('width', "100px")
      .style('height', "50px")
      .style("font-size", 28)

    var event1 = item.contentDocument.querySelector("#时间点1 .cls-3")
    // var event1 = document.getElementById("水滴1")
    // console.log("event1 Y", parseFloat(event1.getAttribute("y2")) + 100)
    var event1X = parseFloat(event1.getAttribute("x1"));
    var event1Y = parseFloat(event1.getAttribute("y2"));

    var foreignObject1 = d3.select(canvas).append("foreignObject")
      .style('width', "100px")
      .style('height', "100px")
      .attr("x", event1X - 55)
      .attr("y", event1Y + 20)
    var label1, info1;
    var label1SVG = foreignObject1.append("xhtml:object").attr("data", "label3.svg")
      .style('width', "100%")
      .style('height', "100%")
      .on("load", function() {
        label1 = this.contentDocument.querySelector("#icon path")
        info1 = this.contentDocument.querySelector("#info1")
        info1.setAttribute('fill', "#fff")
    })



    var event2 = item.contentDocument.querySelector("#时间点2 line")
    var event2X = parseFloat(event2.getAttribute("x1"));
    var event2Y = parseFloat(event2.getAttribute("y2"));
    var foreignObject2 = d3.select(canvas).append("foreignObject")
      .style('width', "100px")
      .style('height', "100px")
      .attr("x", event2X - 95)
      .attr("y", event2Y + 10)
      .on("click", showEvent2Info)
      .style('cursor', "pointer")

    var label2, info2;
    var label2SVG = foreignObject2.append("xhtml:object").attr("data", "label3.svg")
      .style('width', "100%")
      .style('height', "100%")
      .on("load", function() {
        label2 = this.contentDocument.querySelector("#icon path");
        info2 = this.contentDocument.querySelector("#info2");
        info2.setAttribute('fill', "#fff");
        info2.style.cursor = "pointer";
      })

    function brushed(event) {
      // console.log("event", event);

      const selection = event.selection;
      selectedPoints = [];
      // console.log("selection", selection);

      leftHandle.setAttribute("x", selection[0] - 20);
      rightHandle.setAttribute("x", selection[1]);
      
      leftCircle.attr("cx", selection[0] - 20);
      rightCircle.attr("cx", selection[1] + 20);
      selectionLine.attr("x1", selection[0])
                   .attr("x2", selection[1])
             
      var startInterval = (selection[0] - 92) * 91 / 1698;
      var endInterval = (selection[1] - 92) * 91 / 1698;

      var startDate = new Date(2022, 0, 2);
      var endDate = new Date(2022, 0, 2);
      startDate = new Date(startDate.setDate(startDate.getDate() + startInterval));
      endDate = new Date(endDate.setDate(endDate.getDate() + endInterval));

      startBox.attr('x', selection[0] - 90)
        .text(startDate.Format("yyyy-MM-dd"));
      endBox.attr('x', selection[1] - 60)
        .text(endDate.Format("yyyy-MM-dd"));

      var ellipses = item.contentDocument.querySelectorAll('#图层_7 ellipse');
      // console.log("ellipses", ellipses)

      if (selection === null) {
        return;
      }

      for (let i = 0; i < ellipses.length; i++) {
        ellipses[i].classList.remove('setToGray')
        let value = ellipses[i].cx.animVal.value
        if (selection[0] > value || value > selection[1]) {
          ellipses[i].classList.add('setToGray')
        } else {
          var thisPoint = pointData.find(item => item.blh == ellipses[i].getAttribute("data-name"));
          thisPoint.path = thisPoint.xzq + "-" + thisPoint.nld
          selectedPoints.push(thisPoint)
        }

      }


     

      var lines1 = item.contentDocument.querySelectorAll('#图层_8 #时间点1 line');
      for (let i = 0; i < lines1.length; i++) {
        lines1[i].classList.remove('setToAlive');
        if (selection[0] < event1X && event1X < selection[1]) {
          lines1[i].classList.add('setToAlive')
          foreignObject1.style('width', "200px")
                       .style('height', "200px")
                       .attr("x", event1X - 110);
          label1.classList.add('changeColor');
          info1.style.opacity = 1;

        } else {
          foreignObject1.style('width', "100px")
                       .style('height', "100px")
                       .attr("x",event1X - 55);
          label1.classList.remove('changeColor');
          info1.style.opacity = 0;
        }
      }

      var lines2 = item.contentDocument.querySelectorAll('#图层_8 #时间点2 line');
      var polylines2 = item.contentDocument.querySelectorAll('#图层_8 #时间点2 polyline');
      for (let i = 0; i < lines2.length; i++) {
        lines2[i].classList.remove('setToAlive')
        polylines2[i].classList.remove('setToAlive')
        if (selection[0] < lines2[1].getAttribute("x1") && lines2[3].getAttribute("x2") < selection[1]) {
          lines2[i].classList.add('setToAlive');
          polylines2[i].classList.add('setToAlive');

          foreignObject2.style('width', "200px")
                       .style('height', "200px")
                       .attr("x", event2X - 150);
          label2.classList.add('changeColor');
          info2.style.opacity = 1;

        } else {
          // tooltip.style.opacity = 0;
          foreignObject2.style('width', "100px")
                       .style('height', "100px")
                       .attr("x", event2X - 95);
          label2.classList.remove('changeColor');
          info2.style.opacity = 0;

        }
      }
      


      if (event.type == "end") {
        resetMapChart();
        resetStatsChart();
        setSankeyChart(item);
      }
    }

  })

}

Date.prototype.Format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  // if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

function showEvent2Info(event) {
  console.log('event', event);
}

// svg-桑基图
function setSankeyChart(item) {

  var nodesGroup = []
  var linksGroup = [];
  selectedPoints.map(function (eachItem) {

    // Nodes组
    var nodesIndex = nodesGroup.findIndex(function (newItem) {
      return newItem.nld === eachItem.nld
    });
    if (nodesIndex == -1) {
      nodesGroup.push({
        nld: eachItem.nld,
        dataList: [eachItem]
      })
    } else {
      nodesGroup[nodesIndex].dataList.push(eachItem)
    }

    // Links组
    var linksIndex = linksGroup.findIndex(function (newItem) {
      return newItem.path === eachItem.path
    });
    if (linksIndex == -1) {
      linksGroup.push({
        path: eachItem.path,
        dataList: [eachItem]
      })
    } else {
      linksGroup[linksIndex].dataList.push(eachItem)
    }
  })
  // console.log("nodesGroup", nodesGroup)
  // console.log("linksGroup", linksGroup)


  // 设置nodes长度、统计个数
  var nldNodes = item.contentDocument.querySelectorAll('#图层_3 #Nodes #年龄段Nodes rect');
  for (let i = 0; i < nldNodes.length; i++) {

    nldNodes[i].classList.remove('setToGray')

    let thisNodeIndex = nodesGroup.findIndex(item => item.nld == nldNodes[i].getAttribute("data-name"))
    if (thisNodeIndex !== -1) {
      // nldNodes[i].height = 150 + nodesGroup[thisNodeIndex].dataList.length * 5;
      nldNodes[i].setAttribute('height', 150 + nodesGroup[thisNodeIndex].dataList.length * 0.3)
    } else {
      // nldNodes[i].height = 150;
      nldNodes[i].setAttribute('height', 150);
      nldNodes[i].classList.add('setToGray')
    }
  }

  var nldLabel = item.contentDocument.querySelectorAll('#图层_3 #Label #年龄段编组 text');
  for (let i = 0; i < nldLabel.length; i++) {

    nldLabel[i].classList.remove('setToGray')

    nldLabel[i].style.opacity = 0;
    let thisLabelIndex = nodesGroup.findIndex(item => item.nld == nldLabel[i].getAttribute("data-name"))

    setTimeout(() => {
      if (thisLabelIndex !== -1) {
        nldLabel[i].innerHTML = nodesGroup[thisLabelIndex].dataList.length;
      } else {
        nldLabel[i].innerHTML = 0;
      }

      nldLabel[i].style.opacity = 1;
    }, 400);
  }

  // 设置links粗细
  var paths = item.contentDocument.querySelectorAll('#图层_3 #Links path');
  for (let i = 0; i < paths.length; i++) {
    let thisLineIndex = linksGroup.findIndex(item => item.path == paths[i].getAttribute("id"))
    if (thisLineIndex !== -1) {
      paths[i].style.strokeWidth = linksGroup[thisLineIndex].dataList.length * 0.08;
    } else {
      paths[i].style.strokeWidth = 0;
    }
  }
  // console.log("paths", paths)

}