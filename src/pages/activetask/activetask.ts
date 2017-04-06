import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { Platform , NavController, ToastController, Events } from 'ionic-angular';
import { Device } from 'ionic-native';
import { consts } from '../../config/consts';
import { Worker } from './worker';
//import { BackgroundMode } from 'ionic-native';
//import { BackgroundMode } from '@ionic-native/background-mode';

declare var cordova: any;

@Component({
  selector: 'page-contact',
  templateUrl: 'activetask.html'
})
export class ActiveTask {

  task: any;
  worker : Worker;
  device_status: String;
  //private backgroundMode: BackgroundMode,
  constructor(public platform: Platform, public navCtrl: NavController, public toastCtrl: ToastController, public events: Events, @Inject(Http) public http: Http) {
    this.worker = new Worker;
    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.setDefaults({
      title: 'Reckon',
      text: "Doing heavy task.",
      icon: 'icon', // this will look for icon.png in platforms/android/res/drawable|mipmap
      color: '00AA00',
      resume: true,
      hidden: false,
      bigText: 'Reckon: working something big'
    })
    cordova.plugins.backgroundMode.overrideBackButton();

    events.subscribe('task:activated', () => {
      // if(window.localStorage.getItem('task') == 'true'){
      //    this.showToast('Can`t start new task before ')
      // }
      this.start();
    });
    this.start();
  }

  ionViewDidEnter(){
     this.platform.registerBackButtonAction((e)=>{
         cordova.plugins.backgroundMode.moveToBackground();
         cordova.plugins.backgroundMode.excludeFromTaskList();
         return false;
      },100);
   }

  private start() : void {
     this.getActiveTask()
          .then((status)=>{
             return status ? this.getTaskData() : Promise.resolve(false);
          })
          .then(data=>{
             return data ? this.worker.task(data.type,data.data,data.part) : Promise.resolve(false);
          })
          .then(result=>{
             return result ? this.postTaskData(result) : Promise.resolve(false);
          })
          .then(state=>{
             state && this.start();
          })
 }

  private getActiveTask(): Promise<any> {
    let url = `${consts.url}/tasks/active?id_device=${(Device.uuid || 123)}`;

    return this.http.get(url).timeout(consts.timeout).retry(consts.retry).toPromise()
      .then(resdata => {
        let data = resdata.json();
        let task = data.task;
        this.task = {
          id: task.id || '',
          title: task.title || '',
          created: task.created || '',
          author: task.author || '',
          description: task.description || ''
        }
        this.device_status = 'working' ;// data.device.status;
        return true;
      })
      .catch(error => {
        let data = error.json();
        console.log('<ActiveTask> getActiveTask error:', data.error || error);
        this.showToast('Can`t active this task on your device. Try another task or wait some minets.')
        this.device_status = 'stoped' || 'unknown';
        return false;
      })
  }

  private getTaskData() : Promise<any> {
     let url = `${consts.url}/tasks/dotask?id_task=${this.task.id}&device_id=${Device.uuid || 123}`;

     return this.http.get(url).timeout(consts.timeout).retry(consts.retry).toPromise()
      .then(res=>{
         let data= res.json();
         console.log('doTask data',data);
         return data;
      })
      .catch(error=>{
         console.error('<ActiveTask> getTaskData error:',error);
         this.device_status = 'stoped';
         this.showToast('Try another task. This task is may to be finished or off from running.')
         return false;
      })
  }

  private postTaskData(data: any) : Promise<any>{
     let url = `${consts.url}/tasks/dotask`;
     let resp_data = {
        id_task: this.task.id,
        result:data.result,
        part_id: data.part_id,
        device_id:Device.uuid || 123
     }
     return this.http.post(url,resp_data).timeout(consts.timeout).retry(consts.retry).toPromise()
     .catch(error=>{
        this.device_status = 'stoped';
        console.log('<ActiveTask> postTaskData error:',error)
        return false;
     })
 }

  private showToast(message: any) {
    let toast = this.toastCtrl.create({
      message: (typeof message == 'string') ? message : message.toString().substring(0, (message.toString().indexOf('&#x') || message.toString().length)),
      position: 'bottom',
      showCloseButton: true,
      duration: 9000
    });
    toast.present();
  }

}
