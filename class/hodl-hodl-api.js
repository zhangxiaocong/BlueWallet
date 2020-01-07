import Frisbee from 'frisbee';

export class HodlHodlApi {
  static PAGINATION_LIMIT = 'limit'; // int
  static PAGINATION_OFFSET = 'offset'; // int

  static FILTERS_ASSET_CODE = 'asset_code';
  static FILTERS_ASSET_CODE_VALUE_BTC = 'BTC';
  static FILTERS_ASSET_CODE_VALUE_BTCLN = 'BTCLN';

  static FILTERS_SIDE = 'side';
  static FILTERS_SIDE_VALUE_BUY = 'buy';
  static FILTERS_SIDE_VALUE_SELL = 'sell';

  static FILTERS_INCLUDE_GLOBAL = 'include_global'; // bool
  static FILTERS_ONLY_WORKING_NOW = 'only_working_now'; // bool
  static FILTERS_COUNTRY = 'country'; // code or name (or "Global")
  static FILTERS_COUNTRY_VALUE_GLOBAL = 'Global'; // code or name
  static FILTERS_CURRENCY_CODE = 'currency_code';
  static FILTERS_PAYMENT_METHOD_ID = 'payment_method_id';
  static FILTERS_PAYMENT_METHOD_TYPE = 'payment_method_type';
  static FILTERS_PAYMENT_METHOD_NAME = 'payment_method_name';
  static FILTERS_VOLUME = 'volume';
  static FILTERS_PAYMENT_WINDOW_MINUTES_MAX = 'payment_window_minutes_max'; // in minutes
  static FILTERS_USER_AVERAGE_PAYMENT_TIME_MINUTES_MAX = 'user_average_payment_time_minutes_max'; // in minutes
  static FILTERS_USER_AVERAGE_RELEASE_TIME_MINUTES_MAX = 'user_average_release_time_minutes_max'; // in minutes

  static SORT_DIRECTION = 'direction';
  static SORT_DIRECTION_VALUE_ASC = 'asc';
  static SORT_DIRECTION_VALUE_DESC = 'desc';

  static SORT_BY = 'by';
  static SORT_BY_VALUE_PRICE = 'price';
  static SORT_BY_VALUE_PAYMENT_WINDOW_MINUTES = 'payment_window_minutes';
  static SORT_BY_VALUE_USER_AVERAGE_PAYMENT_TIME_MINUTES = 'user_average_payment_time_minutes';
  static SORT_BY_VALUE_USER_AVERAGE_RELEASE_TIME_MINUTES = 'user_average_release_time_minutes';
  static SORT_BY_VALUE_RATING = 'rating';

  constructor() {
    this.baseURI = 'https://hodlhodl.com/';
    this.apiKey = 'cmO8iLFgx9wrxCe9R7zFtbWpqVqpGuDfXR3FJB0PSGCd7EAh3xgG51vBKgNTAF8fEEpS0loqZ9P1fDZt';
    this._api = new Frisbee({ baseURI: this.baseURI });
  }

  async getCountries() {
    let response = await this._api.get('/api/v1/countries', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.apiKey,
      },
    });

    let json = response.body;
    if (!json || !json.countries) {
      throw new Error('API failure: ' + JSON.stringify(response));
    }

    if (json.status === 'error') {
      console.warn(json);
      throw new Error('API: ' + json.error + ' (code ' + json.error_code + ')');
    }

    return (this._countries = json.countries);
  }

  async getMyCountryCode() {
    let _api = new Frisbee({ baseURI: 'https://ifconfig.co/' });
    let response = await _api.get('/country-iso', {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });

    let body = response.body;
    if (typeof body === 'string') body = body.replace('\n', '');
    if (!body || body.length !== 2) {
      throw new Error('API failure: ' + JSON.stringify(response));
    }

    return (this._myCountryCode = body);
  }

  async getOffers(pagination = {}, filters = {}, sort = {}) {
    let uri = [];
    for (let key in sort) {
      uri.push('sort[' + key + ']=' + sort[key]);
    }
    for (let key in filters) {
      uri.push('filters[' + key + ']=' + filters[key]);
    }
    for (let key in pagination) {
      uri.push('pagination[' + key + ']=' + pagination[key]);
    }
    let response = await this._api.get('/api/v1/offers?' + uri.join('&'), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.apiKey,
      },
    });

    let json = response.body;
    if (!json || !json.offers) {
      throw new Error('API failure: ' + JSON.stringify(response));
    }

    if (json.status === 'error') {
      console.warn(json);
      throw new Error('API: ' + json.error + ' (code ' + json.error_code + ')');
    }

    return (this._offers = json.offers);
  }
}
