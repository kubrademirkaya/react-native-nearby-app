import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import {API_ENDPOINT,API_KEY} from '../../constants';
import Places from '../Places';

import MapView, { Marker } from 'react-native-maps';

export default class Map extends Component {
  
    state = {
      region: {
        latitude: 40.7794,
        longitude: 30.3077,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
        },
        places: [],
        fetching: false
  
    };
  
  
    async componentDidMount() {
      try{
        const { coords: { latitude, longitude } } = await this.getCurrentPosition();
        //console.log(coords);
        this.setState({
          region: {
            ...this.state.region,
            latitude, 
            longitude
          },
          fetching: true
        });
        const { data: { results } } = await axios.get(`${API_ENDPOINT}/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=restaurant&key=${API_KEY}`)
        this.setState({
          places: results,
          fetching: false
        });
      }catch (e) {
        this.setState({
          fetching: false
        });
       alert('konum alınamadı')
      }
    }

getCurrentPosition(){
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(position), //başarılı
      () => reject(), //başarısız
      {
        timeout: 5000,
        maximumAge: 1000,
        enableHighAccuracy: false
      }
    )
  })
}

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          showsUserLocation={true}
          region={this.state.region}
          ref={ref => this.map = ref}
        >
          {
          this.state.places.map(place => {
							const { geometry: { location: { lat, lng }} } = place;
							console.log(place);
							return(
								<Marker
									key={place.id}
									coordinate={{
										latitude: lat,
										longitude: lng
                  }}
                  title={place.name}
                  />
              )
            })
          }
        </MapView>
        <View style={styles.placesContainer}>
          {
            this.state.fetching ? <Text style={styles.loading}>Yukleniyor...</Text> : <Places map={this.map} places={this.state.places} />
          }
          
        </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  map: {
    flex: 1
  },
  placesContainer: {
		position: 'absolute',
		left: 0,
		bottom: 0,
		width: '100%',
		height: 140,
		alignItems: 'center',
		justifyContent: 'center'
	},
	loading: {
		padding: 10,
		backgroundColor: '#f1f1f1',
		fontSize: 13,
		color: '#333'
	}
});
