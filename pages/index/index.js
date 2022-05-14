//index.js
const app = getApp()
const db = app.globalData.db
import * as echarts from '../../ec-canvas/echarts';
let chart;

function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  chart.setOption(option);
  return chart;
}
var option = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line'
    }
  ],
  grid: {
    // 绘图网格与底部的距离
    y2: 80,
    // 绘图网格与顶部的距离
    y:20,
    // 绘图网格与左侧的距离
    x: 30,
    x2:30
  }

};

Page({
  data: {
    ec: {
      onInit: initChart
    }
  },

  stopMaking(){

  },

  stopGettingOrders(){

  },

  sendNewMessage(){

  },
  
  initpage(){

  },

  onLoad: function () {
    if (app.globalData.initCloud) { // 云初始化已完成
      this.initpage() // do something
    } else {
      app.watch(() => this.initpage())
    }
  },
  
})
