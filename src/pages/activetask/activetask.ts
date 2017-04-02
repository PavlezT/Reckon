import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { NavController, ToastController, Events } from 'ionic-angular';
import { Device } from 'ionic-native';
import { consts } from '../../config/consts';
//import { BackgroundMode } from 'ionic-native';
//import { BackgroundMode } from '@ionic-native/background-mode';

declare var cordova: any;

@Component({
  selector: 'page-contact',
  templateUrl: 'activetask.html'
})
export class ActiveTask {

  task: any;
  device_status: String;
  //private backgroundMode: BackgroundMode,
  constructor(public navCtrl: NavController, public toastCtrl: ToastController, public events: Events, @Inject(Http) public http: Http) {
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
      this.getActiveTask();
    });
    this.getActiveTask();
  }

  private getActiveTask(): void {
    let url = `${consts.url}/tasks/active?id_device=${(Device.uuid || 123)}`;

   //  cordova.plugins.backgroundMode.excludeFromTaskList();
   //  cordova.plugins.backgroundMode.moveToBackground();
   //  cordova.plugins.backgroundMode.excludeFromTaskList();

    this.http.get(url).timeout(consts.timeout).retry(consts.retry).toPromise()
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
        this.device_status = data.device.status;
      })
      .catch(error => {
        let data = error.json();
        console.log('<ActiveTask> getActiveTask error:', data.error || error);
        this.device_status = (data.device && data.device.status) || 'unknown';
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
