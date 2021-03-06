import Vue from 'vue'
import Vuex from 'vuex'

import oneSite from './widgets/siteTree'
import tabTree from './widgets/widgetTree'
const htmlCon = window.htmlConfig
import { getQueryUrl } from '~/widgets/util'
import {getConfig} from './server/api'
Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    pid: 1000,
    configShow:false,
    page_id: getQueryUrl('page_id'),
    htmlCon,
    currentConfig:null,
    site: oneSite,
    tabTree:tabTree,
    widgets: []
  },

  mutations: {
    assignState (state, obj) {
      Object.assign(state, obj)
    },
    setWidget({widgets},arr){
      // widgets.length=0;
      widgets.splice(0,widgets.length)
      arr.map(item=>{widgets.push(item)});
    },
    sortWidget (state, { array, oldIndex, newIndex }) {
      console.log("storeSort")
      let target = array[oldIndex]
      array.splice(oldIndex, 1)
      array.splice(newIndex, 0, target)
    },
    copyWidget (state,{array, oldIndex, newIndex}){
      console.log("copyEl",oldIndex,newIndex)
      store.commit('incrementGid')
      //let el=array[oldIndex]  浅拷贝有问题
      let el= JSON.parse(JSON.stringify(array[oldIndex]));
      el.id=state.pid;
      array.splice(-1,0,el)
      // store.commit('setConfig',{oldIndex:newIndex,currDom:el})
    },
    addWidget ({widgets, pid, site}, { section, widgetType, newIndex, config }) {
      console.log("addWidget:"+newIndex);
      const widget = widgets.find(widget => widget.placeholder.type === widgetType);
      let styl={},other={};
      config&&(config.map(item=>{
        if(item.remark === 'css'){
          styl[item.name] = item.default_val
        }else{
          other[item.name] = item.default_val
        }
      }))
      // store.commit('incrementGid')
      let obj={ ...widget.placeholder, config,styl,other, id: pid ,name:widget.name}
      if (widget.w=='floor') {
        // section.splice(newIndex,1);
        section.splice(newIndex, 0, obj)
        section[newIndex].children = []
        store.commit('setConfig',{oldIndex:newIndex,currDom:site})
        return false
      }
      section.splice(newIndex,0,obj);
    },
    delCurrDom ({site}, {section, oldIndex}) {
      store.commit('setConfig', { oldIndex: -1, currDom: {} })
      section.splice(oldIndex, 1)
      store.commit('changeShow',false)
    },
    setConfig (stat, {oldIndex, currDom}) {
      console.log("setConfig")
      stat.currentConfig = null
      oldIndex >= 0 && (currDom.index = oldIndex)
      stat.currentConfig = {...currDom}
      console.log({...currDom})
      store.commit('changeShow',true)
      console.log(currDom)
    },
    changeShow(sta,val){
      console.log("show")
      sta.configShow=val
    },
    incrementGid (state) {
      console.log("addPid")
      state.pid++;
    }
  },
  actions: {
    async getSite ({ commit }) {
      const site =await window.config&&window.config.type?window.config:oneSite
      commit('assignState', { site })
      // commit('assignState', { currentPage: site.children[0] })
    },
    setSite({commit},site){
      commit('assignState',{site})
    },
    getDefaultConfig({commit},{section,widgetType,newIndex,model_id}){
      getConfig({"model_id":model_id}).then(res=>{
        commit('addWidget',{section,widgetType,newIndex,config:res.data['props']})
      })
    }
  }
})

export default store
