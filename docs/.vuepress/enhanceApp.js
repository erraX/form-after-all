import VueComposition from '@vue/composition-api';
import { Form, Field } from '../../es/index';

export default ({ Vue }) => {
  Vue.use(VueComposition);
  Vue.component('Form', Form);
  Vue.component('Field', Field);
};
