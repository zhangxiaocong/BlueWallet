/* global alert */
import React, { Component } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableHighlight } from 'react-native';
import { BlueNavigationStyle, BlueLoading, BlueCard } from '../../BlueComponents';
import PropTypes from 'prop-types';
import { HodlHodlApi } from '../../class/hodl-hodl-api';

const TABS = Object.freeze({
  BUY: 'buy',
  SELL: 'sell',
});

const styles = StyleSheet.create({
  SelectedTab: {
    fontWeight: 'bold',
    fontSize: 21,
  },
  UnselectedTab: {
    // color: 'grey',
    fontSize: 20,
    textDecorationLine: 'underline',
  },
});

const HodlApi = new HodlHodlApi();

export default class HodlHodl extends Component {
  static navigationOptions = ({ navigation }) => ({
    ...BlueNavigationStyle(),
    title: 'Local Trader (powered by HodlHodl)',
  });

  constructor(props) {
    super(props);
    /**  @type {AbstractWallet}   */
    let wallet = props.navigation.state.params.wallet;

    this.state = {
      isLoading: true,
      currentTab: TABS.BUY,
      wallet,
      sellOffers: [],
      buyOffers: [],
      country: HodlHodlApi.FILTERS_COUNTRY_VALUE_GLOBAL,
      myCountryCode: HodlHodlApi.FILTERS_COUNTRY_VALUE_GLOBAL,
    };
  }

  async fetchOffers() {
    let pagination = {
      [HodlHodlApi.PAGINATION_LIMIT]: 100,
    };
    let filters = {
      [HodlHodlApi.FILTERS_COUNTRY]: this.state.country,
      [HodlHodlApi.FILTERS_SIDE]: HodlHodlApi.FILTERS_SIDE_VALUE_SELL,
      [HodlHodlApi.FILTERS_ASSET_CODE]: HodlHodlApi.FILTERS_ASSET_CODE_VALUE_BTC,
      [HodlHodlApi.FILTERS_INCLUDE_GLOBAL]: this.state.country === HodlHodlApi.FILTERS_COUNTRY_VALUE_GLOBAL,
    };
    let sort = {
      [HodlHodlApi.SORT_BY]: HodlHodlApi.SORT_BY_VALUE_PRICE,
      [HodlHodlApi.SORT_DIRECTION]: HodlHodlApi.SORT_DIRECTION_VALUE_ASC,
    };
    const sellOffers = await HodlApi.getOffers(pagination, filters, sort);

    filters[HodlHodlApi.FILTERS_SIDE] = HodlHodlApi.FILTERS_SIDE_VALUE_BUY;
    const buyOffers = await HodlApi.getOffers(pagination, filters, sort);

    this.setState({
      sellOffers,
      buyOffers,
    });
  }

  async changeCountry() {
    let country =
      this.state.country === HodlHodlApi.FILTERS_COUNTRY_VALUE_GLOBAL ? this.state.myCountryCode : HodlHodlApi.FILTERS_COUNTRY_VALUE_GLOBAL;

    this.setState(
      {
        isLoading: true,
        country,
      },
      async () => {
        await this.fetchOffers();
        this.setState({
          isLoading: false,
        });
      },
    );
  }

  async componentDidMount() {
    console.log('hodlHodl - componentDidMount');

    try {
      let myCountryCode = await HodlApi.getMyCountryCode();
      this.setState({
        myCountryCode,
        country: myCountryCode,
      });
      await this.fetchOffers();
    } catch (Error) {
      alert(Error.message);
      return;
    }

    this.setState({
      isLoading: false,
    });
  }

  _onPress(item) {}

  render() {
    return (
      <View>
        <BlueCard style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text
              style={this.state.country === this.state.myCountryCode ? styles.SelectedTab : styles.UnselectedTab}
              onPress={() => this.changeCountry()}
            >
              {this.state.myCountryCode}
            </Text>
            <Text> </Text>
            <Text
              style={this.state.country !== this.state.myCountryCode ? styles.SelectedTab : styles.UnselectedTab}
              onPress={() => this.changeCountry()}
            >
              Global
            </Text>
          </View>

          <Text> </Text>
          <View style={{ flexDirection: 'row' }}>
            <Text
              onPress={() => {
                this.setState({ currentTab: TABS.BUY });
              }}
              style={(this.state.currentTab === TABS.BUY && styles.SelectedTab) || styles.UnselectedTab}
            >
              Buy Bitcoin
            </Text>
            <Text> </Text>
            <Text
              onPress={() => {
                this.setState({ currentTab: TABS.SELL });
              }}
              style={(this.state.currentTab === TABS.SELL && styles.SelectedTab) || styles.UnselectedTab}
            >
              Sell Bitcoin
            </Text>
          </View>

          {(this.state.isLoading && <BlueLoading />) || (
            <View>
              <FlatList
                ItemSeparatorComponent={() => <View style={{ height: 0.5, width: '100%', backgroundColor: '#C8C8C8' }} />}
                data={(this.state.currentTab === TABS.BUY && this.state.sellOffers) || this.state.buyOffers}
                renderItem={({ item, index, separators }) => (
                  <TouchableHighlight
                    onPress={() => this._onPress(item)}
                    onShowUnderlay={separators.highlight}
                    onHideUnderlay={separators.unhighlight}
                  >
                    <View style={{ backgroundColor: 'white' }}>
                      <Text>{item.trader.login}</Text>
                      <Text style={{ color: 'grey' }}>(rating: {Math.round(item.trader.rating * 100)}%)</Text>
                      <Text>{item.title}</Text>
                      <Text>
                        {item.price} {item.currency_code}
                      </Text>
                      <Text style={{ color: 'grey' }}>
                        (Min/Max {item.min_amount}-{item.max_amount} {item.currency_code})
                      </Text>
                      <Text> </Text>
                    </View>
                  </TouchableHighlight>
                )}
              />
            </View>
          )}
        </BlueCard>
      </View>
    );
  }
}

HodlHodl.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        wallet: PropTypes.object,
      }),
    }),
  }),
};
