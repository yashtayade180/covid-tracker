import React, { useEffect, useState } from 'react';
import { Card, CardContent, FormControl, MenuItem, Select } from "@mui/material"
import InfoBox from './Infobox';
import Table from "./Table";
import {sortData, prettyPrintStat } from "./util";
import Map from './Map';
import './App.css';
import "leaflet/dist/leaflet.css";


function App() {
  const [countries, setCountries] = useState([]);
  const [country, setInputCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);

  useEffect(() => {
     fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then((data) => {
      setCountryInfo(data);
    });  
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
       .then((response) => response.json())
       .then((data) => {
         
          const countries = data.map((country) => ({
             name: country.country,
             value: country.countryInfo.iso2,
          }));
          
          let sortedData = sortData(data);
          setMapCountries(data);
          setTableData(sortedData);
          setCountries(countries);
       });
    };

    getCountriesData(); 

  }, []);

  //console.log(casesType);

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    //setInputCountry(countryCode);

    const url = 
      countryCode === 'worldwide'
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    
    await fetch(url)
    .then((response) => response.json())
    .then((data) => {
      setInputCountry(countryCode);
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat , data.countryInfo.long]);
      setMapZoom(4);
    });   
  };

  return (
    <div className="app">
      <div className="app_left">
        <div className="app_header">
          <h1>COVID-19 TRACKER BY YASH</h1>
          <FormControl className = "app_dropdown">
             <Select variant= "outlined" onChange={onCountryChange} value = {country} >
              {/* Loop through all countries to create a dropdown list*/}

              <MenuItem value = "worldwide"> Worldwide </MenuItem>
                {countries.map((country) => (
                  <MenuItem value = {country.value}> {country.name} </MenuItem>
                ))}
                
               {/*<MenuItem value = "worldwide "> worldwide </MenuItem>            
               <MenuItem value = "worldwide "> worldwide </MenuItem>*/}
             </Select>
          </FormControl>
        </div>
      
        <div className='app_stats'>
        <InfoBox 
          isRed active={casesType==="cases"} 
          onClick={(e) => setCasesType("cases")} 
          title="Coronavirus Cases" 
          cases={prettyPrintStat(countryInfo.todayCases)} 
          total={countryInfo.cases} 
        />
        <InfoBox 
          active={casesType==="recovered"} 
          onClick={(e) => setCasesType("recovered")} 
          title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} 
          total={countryInfo.recovered} 
        />
        <InfoBox 
          isRed active={casesType==="deaths"} 
          onClick={(e) => setCasesType("deaths")} 
          title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} 
          total={countryInfo.deaths} 
        />
        </div>
      <Map
        casesType={casesType}        
        countries={mapCountries}
        center={mapCenter}
        zoom={mapZoom}
      />
      </div>
      <Card className='app_right'>
        <CardContent>
          <h3>Live cases by country</h3>
          <Table countries={tableData}/>          
        </CardContent>

      </Card>
      
      
    </div>
  );
}

export default App;
