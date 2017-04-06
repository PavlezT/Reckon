

export class Worker {

   public task(type: string, data : any,part_id:string) : Promise<any> {
      switch(type) {
         case 'FBL':
            return this.findBigLetters(data,part_id);
          default :
             console.log('no type find');
             return Promise.reject('no type find');
      }
  }

   public findBigLetters(data,part_id): Promise<any>{
      let result = data.match(/[A-Z]/g) || [];
      return Promise.resolve({result:result,part_id:part_id});
   }
}
