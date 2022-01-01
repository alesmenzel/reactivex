import {atom} from './atom';
import {deriveStructured, derive} from './derive';

describe('Derived', () => {
  describe('Derive', () => {
    it('emits update on change', () => {
      const listener = jest.fn();
      const quantity = atom(10);
      const price = atom(200);

      const total = derive([quantity, price], (quantity, price) => quantity + price)

      total.subscribe(listener);
      quantity.value = 15
      price.value = 210
      expect(listener).toBeCalledTimes(2);
      expect(listener).nthCalledWith(1, 3000);
      expect(listener).nthCalledWith(1, 3150);
    });
  });

  describe('DeriveStructured', () => {
    it('emits update on change', () => {
      const listener = jest.fn();
      const quantity = atom(10);
      const price = atom(200);

      const total = deriveStructured({ quantity, price }, ({quantity, price}) => quantity + price)

      total.subscribe(listener);
      quantity.value = 15
      price.value = 210
      expect(listener).toBeCalledTimes(2);
      expect(listener).nthCalledWith(1, 3000);
      expect(listener).nthCalledWith(1, 3150);
    });
  });
});
