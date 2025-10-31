// logic helper functions
import { apiFetchValidEvolutions } from "./gameApi.js";

export function initializeGame(deckNumber, gameGuid, setHand, mulligans) {
  fetch(
    `https://pokeserver20251017181703-ace0bbard6a0cfas.canadacentral-01.azurewebsites.net/game/getnewgame/${deckNumber}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (!data) throw "Game data empty!";
      if (data.gameGuid) gameGuid.current = data.gameGuid;
      if (data.hand) {
        const expandedHand = data.hand.map((card) => ({
          ...card,
          attachedCards: [],
          damageCounters: 0,
        }));
        setHand(expandedHand);
      }
      if (data.mulligans) mulligans.current = data.mulligans;
    })
    .catch((err) => console.error("Error fetching game start:", err));
}

export async function placeCardInSpot({
  card,
  spot,
  state,
  setState,
  helpers,
  gameGuid,
}) {
  const { hand, active, bench, discard } = state;
  const { setHand, setActive, setBench, setDiscard } = setState;
  const { attachOrSwapCard, apiReturnToDeck } = helpers;

  switch (spot) {
    case -1:
      if (hand.includes(card)) break;
      const attached = card.attachedCards.map((c) => ({
        ...c,
        damageCounters: 0,
      }));
      card.attachedCards = [];
      card.damageCounters = 0;
      setHand([...hand, ...attached, card]);
      if (bench.includes(card))
        setBench(bench.filter((c) => c.numberInDeck != card.numberInDeck));
      else if (active && active.numberInDeck == card.numberInDeck)
        setActive(null);
      break;

    case 0:
      if (active) { // placed in occupied spot, try to attach or swap
        let attachedOk = await attachOrSwapCard(card, true);
        if (!attachedOk) return;
      } else {
        if (card.category != "Pokemon"
          || (card.stage != "Basic" && !card.attachedCards.find((c) => c.stage == "Basic"))) {
          return; // placed in an empty spot but not allowed to be
        }
        setActive(card);
      }
      // remove from wherever it came from
      if (hand.includes(card))
        setHand(hand.filter((c) => c.numberInDeck != card.numberInDeck));
      else if (bench.includes(card))
        setBench(bench.filter((c) => c.numberInDeck != card.numberInDeck));
      break;

    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      const idx = spot - 1;
      if (bench.length > idx && bench[idx]) { // placed in occupied spot, try to attach or swap
        let attachedOk = await attachOrSwapCard(card, false, idx);
        if (!attachedOk) return;
      } else {
        if (
          card.category != "Pokemon" ||
          (card.stage != "Basic" &&
            !card.attachedCards.find((c) => c.stage == "Basic"))
        )
          return; // placed in an empty spot but not allowed to be
        setBench([...bench, card]);
      }
      // remove from wherever it came from
      if (hand.includes(card))
        setHand(hand.filter((c) => c.numberInDeck != card.numberInDeck));
      else if (active && active.numberInDeck == card.numberInDeck)
        setActive(null);
      else if (bench.includes(card)) setBench([...new Set(bench)]);
      break;

    case 6:
      let newDiscard = [...card.attachedCards, ...discard];
      card.attachedCards = [];
      newDiscard = [card, ...newDiscard];
      setDiscard(newDiscard);
      removeCard(card, { hand, active, bench, setHand, setActive, setBench });
      break;

    case 7:
      card.attachedCards.forEach((c) => apiReturnToDeck(c, gameGuid));
      apiReturnToDeck(card, gameGuid);
      removeCard(card, { hand, active, bench, setHand, setActive, setBench });
      break;
  }
}

export function removeCard(cardToRemove, { hand, active, bench, setHand, setActive, setBench }) {
  if (hand.includes(cardToRemove))
    setHand(hand.filter((c) => c.numberInDeck != cardToRemove.numberInDeck));
  else if (bench.includes(cardToRemove))
    setBench(bench.filter((c) => c.numberInDeck != cardToRemove.numberInDeck));
  else if (active?.numberInDeck == cardToRemove.numberInDeck) setActive(null);
}

export function tightenHandLayoutLogic(hand, setHand, setRerenderKey) {
  const sorted = [...hand].sort((a, b) =>
    a.category.localeCompare(b.category) // sort by card type
  );
  setHand(sorted);
  setRerenderKey((p) => p + 1); // make sure hand re-renders
}

export async function attachOrSwapCard(
  cardToAttach,
  isActive,
  benchPosition = -1,
  state,
  setState
) {
  const { hand, active, bench, discard } = state;
  const { setHand, setActive, setBench, setDiscard } = setState;

  // handle Pokémon Breeder evolution shortcut
  if (cardToAttach.name == "Pokémon Breeder") {
    const baseName = isActive ? active.name : bench[benchPosition].name;
    const validStageOneNames = await apiFetchValidEvolutions(baseName);
    const stageTwo = hand.find((card) =>
      validStageOneNames.includes(card.evolveFrom)
    );
    if (!stageTwo) {
      console.log(
        `Pokémon Breeder: ${baseName} cannot evolve right now — sending back to hand`
      );
      return false;
    }

    // evolution logic
    if (isActive) {
      stageTwo.attachedCards = [...active.attachedCards, active];
      stageTwo.damageCounters = active.damageCounters;
      setActive(stageTwo);
    } else {
      stageTwo.attachedCards = [
        ...bench[benchPosition].attachedCards,
        bench[benchPosition],
      ];
      stageTwo.damageCounters = bench[benchPosition].damageCounters;
      const newBench = bench.map((c, i) =>
        i == benchPosition ? stageTwo : c
      );
      setBench(newBench);
    }

    // remove stage two and trainer card from hand...
    setHand(
      hand.filter((c) =>
          c.numberInDeck != stageTwo.numberInDeck &&
          c.numberInDeck != cardToAttach.numberInDeck)
    );
    // ...and discard Pokémon Breeder
    setDiscard([...discard, cardToAttach]);
    return false;
  }

  if (isActive) {
    if (cardToAttach.category == "Energy") { // attach energy?
      active.attachedCards.push(cardToAttach);
    } else if (hand.includes(cardToAttach) &&
      cardToAttach.evolveFrom == active.name) { // evolve?
      const attached = active.attachedCards;
      active.attachedCards = [];
      cardToAttach.attachedCards = [...attached, active];
      cardToAttach.damageCounters = active.damageCounters;
      setActive(cardToAttach);
    } else if (bench.includes(cardToAttach)) { // swap with bench?
      const newActive = cardToAttach;
      const newBench = bench.filter((c) => c.numberInDeck != newActive.numberInDeck).concat(active);
      setBench(newBench);
      setActive(newActive);
      return false;
    } else return false;

    return true;
  }

  if (cardToAttach.category == "Energy") { // attach energy?
    bench[benchPosition].attachedCards.push(cardToAttach);
  } else if (hand.includes(cardToAttach) &&
    cardToAttach.evolveFrom == bench[benchPosition].name) { // evolve?
    const attached = bench[benchPosition].attachedCards;
    bench[benchPosition].attachedCards = [];
    cardToAttach.attachedCards = [...attached, bench[benchPosition]];
    cardToAttach.damageCounters = bench[benchPosition].damageCounters;
    const newBench = bench.map((c, i) => i == benchPosition ? cardToAttach : c);
    setBench(newBench);
  } else if (active == cardToAttach) { // swap with active?
    setActive(bench[benchPosition]);
    const newBench = bench.map((c, i) => i == benchPosition ? cardToAttach : c);
    setBench(newBench);
    return false;
  } else return false;

  return true;
}