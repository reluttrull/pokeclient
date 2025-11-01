// api helper functions
const BASE = "https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game";

export const apiReturnToDeck = (card, gameGuid) =>
  fetch(`${BASE}/placecardonbottomofdeck/${gameGuid.current}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  }).catch((error) => console.error("Return to deck failed:", error));

export const apiDrawPrize = (gameGuid, hand, setHand, setPrizes, prizeNum, callback) =>
  fetch(`${BASE}/drawcardfromprizes/${gameGuid.current}`)
    .then((response) => response.json())
    .then((data) => {
      data.prizeCard.attachedCards = [];
      data.prizeCard.damageCounters = 0;
      setHand([...hand, data.prizeCard]);
      setPrizes((prize) => prize.filter((n) => n != prizeNum));
      if (data.remainingPrizes == 0) apiEndGame(gameGuid, callback);
    });

export const apiDrawTopCard = (gameGuid, hand, setHand) =>
  fetch(`${BASE}/drawcardfromdeck/${gameGuid.current}`)
    .then((response) => response.json())
    .then((data) => {
      data.attachedCards = [];
      data.damageCounters = 0;
      setHand([...hand, data]);
    });

export const apiEndGame = (gameGuid, callback) =>
  fetch(`${BASE}/endgame/${gameGuid.current}`, { method: "PUT" }).then((response) => {
    if (response.status == 204) callback({ ended: true });
  });

export const apiFlipCoin = (setCoinResult) =>
  fetch(`${BASE}/flipcoin`)
    .then((response) => response.json())
    .then((data) => setCoinResult(data));

export const apiShuffleDeck = (gameGuid) =>
  fetch(`${BASE}/shuffledeck/${gameGuid.current}`, { method: "PUT" });

export const apiFetchCardsFromDeck = (gameGuid, setCardsInDeck) =>
  fetch(`${BASE}/peekatallcardsindeck/${gameGuid.current}`)
    .then((response) => response.json())
    .then((data) => setCardsInDeck(data));

export const apiDrawSpecificCard = (gameGuid, card, hand, setHand, cardsInDeck, setCardsInDeck) =>
  fetch(`${BASE}/drawthiscardfromdeck/${gameGuid.current}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  }).then((response) => {
    if (response.status == 204) {
      card.attachedCards = [];
      card.damageCounters = 0;
      setHand([...hand, card]);
      setCardsInDeck(cardsInDeck.filter((c) => c.numberInDeck != card.numberInDeck));
    }
  });

export const apiFetchValidEvolutions = (pokemonName) =>
  fetch(`${BASE}/getvalidevolutions/${pokemonName}`)
    .then((response) => (response.ok ? response.json() : []))
    .catch(() => []);