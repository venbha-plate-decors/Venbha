import React from 'react';
import { Helmet } from 'react-helmet-async';

const Designs = () => {
    return (
        <div style={{ paddingTop: '150px', textAlign: 'center', height: '60vh' }}>
            <Helmet>
                <title>Collections | Venbha Plate Decors</title>
                <meta name="description" content="Explore our diverse collection of plate decoration designs and themes. Coming soon!" />
            </Helmet>
            <h1 style={{ fontSize: '3rem', color: '#c2185b' }}>Collections</h1>
            <p style={{ fontSize: '1.5rem', marginTop: '20px', color: '#880e4f' }}>Coming Soon...</p>
        </div>
    );
};

export default Designs;
