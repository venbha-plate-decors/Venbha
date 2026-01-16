import React from 'react';
import { Helmet } from 'react-helmet-async';

const Blogs = () => {
    return (
        <div className="page-container" style={{ padding: '100px 20px', minHeight: '60vh', textAlign: 'center' }}>
            <Helmet>
                <title>Blogs | Venbha Plate Decors & Event Tips</title>
                <meta name="description" content="Read our latest blogs and tips on event planning, decoration trends, and more from Venbha Plate Decors." />
            </Helmet>
            <h1>Our Blogs</h1>
            <p>Stay tuned for our latest updates and stories!</p>
        </div>
    );
};

export default Blogs;
