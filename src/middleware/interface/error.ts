/**
 * @interface IError => Mendefinisikan type baru dengan mengimplementasikan Error
 */
export default interface IError extends Error {
  status: number;
}
