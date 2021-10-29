import './App.css';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { green } from '@mui/material/colors';
import React, { useState } from 'react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_51JeOL1FvtlzahqAd2PW79hoZd0GBcUtvKYDUzxXjCcWtjRtgIZwRTxnCWDaLGcsed8lxQ0ZUYMdpv2QcNMv2mIrn00fz45HgBs');

const CARD_OPTIONS = {
    iconStyle: "solid",
    style: {
        base: {
            iconColor: "#c4f0ff",
            color: "#fff",
            fontWeight: 500,
            fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
            fontSize: "16px",
            fontSmoothing: "antialiased",
            ":-webkit-autofill": {
                color: "#fce883"
            },
            "::placeholder": {
                color: "#87bbfd"
            }
        },
        invalid: {
            iconColor: "#ffc7ee",
            color: "#ffc7ee"
        }
    }
};

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function App() {
    const [state, setState] = useState({
        open: false,
        vertical: 'bottom',
        horizontal: 'center',
    });
    const [text, setTexto] = useState("");
  
    const { vertical, horizontal, open } = state;

    const handleClose = () => {
        setState({ ...state, open: false });
    };

    const CheckoutForm = () => {
        const stripe = useStripe();
        const elements = useElements();
        const [loading, setLoading] = useState(false);

        const handleSubmit = async () => {
            setLoading(true);
            if (!stripe || !elements) {
                // Stripe.js has not loaded yet. Make sure to disable
                // form submission until Stripe.js has loaded.
                return;
            }

            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement)
            });

            if (error) {
                console.log('[error]', error.message);
            } else {
                const { id } = paymentMethod;

                await axios.post('http://localhost:3001/api/checkout', {
                    id,
                    amount: 10000
                }).then(response => {
                    setTexto(response.data.message);
                    setState({ ...state, open: true });
                }).catch(error => {
                    console.log(error);
                });

                elements.getElement(CardElement).clear();
            }
            setLoading(false);
        }

        return <Card sx={{ maxWidth: 500 }}>
            <CardMedia
                component="img"
                height="140"
                image="https://mui.com/static/images/cards/contemplative-reptile.jpg"
                alt="green iguana"
            />
            <CardContent>
                <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                    <Grid item>
                        <Typography gutterBottom variant="h4" component="div">
                            Lizard
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography gutterBottom variant="h6" component="div">
                            Price: 100$
                        </Typography>
                    </Grid>
                </Grid>
                <CardElement options={CARD_OPTIONS} />
            </CardContent>
            <CardActions>
                <Box sx={{ m: 1, position: 'relative', width: 200, margin: '0 auto' }}>
                    <Button variant="contained" disabled={!stripe || loading} onClick={handleSubmit} fullWidth={true}>Buy</Button>
                    {loading && (
                        <CircularProgress
                            size={24}
                            sx={{
                                color: green[500],
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-12px',
                                marginLeft: '-12px',
                            }}
                        />
                    )}
                </Box>
            </CardActions>
        </Card>
    }

    return (
        <Elements stripe={stripePromise}>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container justifyContent="center" alignItems="center" spacing={2} style={{ height: 500 }}>
                    <Grid item xs={12} md={4}>
                        <CheckoutForm />
                    </Grid>
                </Grid>
            </Box>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical, horizontal }}>
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    {text}
                </Alert>
            </Snackbar>
        </Elements>
    );
}

export default App;
