import React from 'react';

export default function SetPage({ params }: { params: { user: string; setID: string } }) {
    return (
        <div>
            <h1>Set Page</h1>
            <p>User: {params.user}</p>
            <p>Set ID: {params.setID}</p>
        </div>
    );
}