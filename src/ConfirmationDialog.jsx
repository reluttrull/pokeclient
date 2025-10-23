import * as React from 'react';
import { confirmable, createConfirmation } from 'react-confirm';

const ConfirmationDialog = ({ show, proceed, confirmation }) => (
<div>
<p>{confirmation}</p>
<button onClick={() => proceed(false)}>Cancel</button>
<button onClick={() => proceed(true)}>OK</button>
</div>
);

const confirm = createConfirmation(confirmable(ConfirmationDialog));

export default confirm;