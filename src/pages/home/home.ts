import { Component, Inject } from '@angular/core';
import { Device } from 'ionic-native';
import { Http } from '@angular/http';
import { NavController, Platform, ToastController } from 'ionic-angular';
// import 'rxjs/add/operator/toPromise';
// import 'rxjs/add/operator/timeout';
// import 'rxjs/add/operator/retry';
import { consts } from '../../config/consts';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

   props : any;
   keys : any;

  constructor(public navCtrl: NavController, public platform : Platform,public toastCtrl: ToastController,@Inject(Http) public http : Http) {
     this.props = {
        model:'' ,
        platform : '' ,
        uuid :  '' ,
        version :  '' ,
        manufacturer:  '',
        serial :  '',
        name :  ''
     }
     this.keys = this.getKeys();
     platform.ready().then(()=>{
        this.getProps().then(data=>{
          data && (this.props = data);
       });
     })
  }

  private getProps() : Promise<any> {
      let data = {
         model:Device.model,
         platform : Device.platform || 'browser' ,
         uuid : Device.uuid || 123,
         version : Device.version,
         manufacturer: Device.manufacturer,
         serial : Device.serial,
         name : Device.name || 'webbrowser'
      };
      let url = `${consts.url}/devices`;

      this.http.post(url,data).timeout(consts.timeout).retry(consts.retry).toPromise()
         .then(data=>{if(data.text().indexOf('Ok') > -1)this.showToast('You are connected')})
         .catch(error=>{console.log('<Home> error registering device',error);this.showToast('Error occure while connecting!')})

      return Promise.resolve(data);
    }

   public getKeys() : any {
      return Object.keys(this.props);
   }

   private showToast(message: any){
      let toast = this.toastCtrl.create({
        message: (typeof message == 'string' )? message : message.toString().substring(0,( message.toString().indexOf('&#x') || message.toString().length)) ,
        position: 'bottom',
        showCloseButton : true,
        duration: 9000
      });
      toast.present();
   }

}
