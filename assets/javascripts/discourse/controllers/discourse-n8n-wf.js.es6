import ModalFunctionality from 'discourse/mixins/modal-functionality';
import AjaxLib from 'discourse/lib/ajax';

export default Ember.Controller.extend(ModalFunctionality, {
  toolbarEvent:null,
  content:'',
  addImage:true,
  actions: {
    submit: function() {
      let content = this.get('content');
      console.log(content);

      this.toolbarEvent.addText(content);
      //if (this.composerViewOld) {
        //this.composerViewOld.addMarkdown(content);
      //} else if (this.composerView) {
        //this.composerView._addText(this.composerView._getSelected(), content);
      //}

      this.send("closeModal");
    }
  },

  init: function () {
    this._super();
    //this.setProperties({"loading": true, "parsedContent": ''});
    //AjaxLib.ajax("https://www.google.com/").then(function (resp) {
      //this.set('parsedContent', resp.post_stream.posts[0].cooked);
      //this.refresh();
    //}.bind(this))
  }
});

