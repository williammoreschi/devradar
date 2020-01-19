import React, {useEffect, useState} from 'react';
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import MapView, { Marker, Callout} from 'react-native-maps';
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';

function Main({ navigation }){
    const [devs,setDevs] = useState([]);
    const [currentRegion, setCurrentRegion] = useState(null);
    const [techs, setTechs] = useState('');

    useEffect(()=>{

        async function loadInitialPosition(){
            const { granted } = await requestPermissionsAsync();

            if(granted){
                const {coords} = await getCurrentPositionAsync({
                    enableHighAccuracy: true,
                });

                const { latitude, longitude } = coords;

                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                });
            }
        }

        loadInitialPosition();
    },[]);

    if(!currentRegion){
        return null;
    }

    function handleRegionChange(region){
        setCurrentRegion(region);
    }

    async function loadDevs(){
        const { latitude, longitude } = currentRegion;

        const response  = await api.get('/search',{
         params:{
            latitude,
            longitude,
            techs
         }   
        });

        setDevs(response.data.devs);
    }

    return (
        <>
        <MapView 
        initialRegion={currentRegion} style={styles.map} 
        onRegionChangeComplete={handleRegionChange}
        >
            {devs.map(dev => (
                <Marker 
                    key={dev._id}
                    coordinate={{
                        longitude:dev.location.coordinates[0],
                        latitude:dev.location.coordinates[1]
                    }}
                >
                    <Image 
                    source={{uri: dev.avatar_url }} 
                    style={styles.avatar}
                    />
                    <Callout 
                    onPress={()=>{
                    navigation.navigate('Profile',{github_username: dev.github_username });   
                    }}
                    >
                        <View style={styles.callout}>
                            <Text style={styles.devName} >{dev.name}</Text>
                            <Text style={styles.devBio} >{dev.bio}</Text>
                            <Text style={styles.devTechs} >{dev.techs.join(", ")}</Text>
                        </View>
                    </Callout>
                </Marker>
            ))}
        </MapView>
        <View style={styles.searchForm}>
                <TextInput 
                style={styles.serachInput}
                placeholder="Buscar Devs por techs..."
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
                value={techs}
                onChangeText={text => setTechs(text)}
                />
                <TouchableOpacity onPress={loadDevs} style={styles.loadButton}>
                    <MaterialIcons
                     name="my-location"
                     size={20}
                     color="#fff"
                    />
                </TouchableOpacity>
        </View>
        </>
    );
}

export default Main;

const styles = StyleSheet.create({
    map:{
        flex: 1
    },
    avatar:{
        width:54,
        height:54,
        borderRadius:4,
        borderWidth:4,
        borderColor:'#fff'
    },
    callout:{
        width:260,
        padding:15
    },
    devName:{
        fontWeight:'bold',
        fontSize:16
    },
    devBio:{
        color:'#666666',
        marginTop:5
    },
    devTechs:{
        marginTop:5,
        fontWeight:'bold',
        color:'#000',
        fontSize:10
    },
    searchForm:{
        position:"absolute",
        top:20,
        left:20,
        right:20,
        zIndex:5,
        flexDirection:'row'
    },
    serachInput:{
        backgroundColor:"#fff",
        flex:1,
        height:50,
        color:"#000",
        borderRadius:25,
        paddingHorizontal:20,
        fontSize:16,
        shadowColor:"#000",
        shadowOpacity:0.2,
        shadowOffset:{
            width:5,
            height:5,
        },
        elevation:2 /* Sombra no android somente essa */
    },
    loadButton:{
        width:50,
        height:50,
        backgroundColor: "#8e4dff",
        borderRadius:25,
        justifyContent:"center",
        alignItems:"center",
        marginLeft:10
    }
});