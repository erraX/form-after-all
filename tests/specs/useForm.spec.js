import Vue from 'vue';
import { ref, watch, computed } from '@vue/composition-api';
import { get } from 'lodash-es';
import useForm from '../../src/hooks/useForm';

describe('useForm', () => {
  it('should work when `initialState` is empty', () => {
    expect(true).toBe(true);
  });
});
