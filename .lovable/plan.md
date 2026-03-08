

## Problem

Two issues in the Market Browser:

1. **EventCard** (category view) has expandable markets but no "Explore" button to navigate to the full Event Detail page.
2. **AnalyticsView "Top Events"** section shows static, non-interactive cards -- no expand, no bet calculator, no explore link.

## Plan

### 1. Add "Explore" button to EventCard
- Import `useNavigate` and add a button that navigates to `/event` with the event passed via router state.
- Place it next to the existing status/volume badges.

### 2. Replace static cards in AnalyticsView with EventCard
- Swap the plain `<div>` cards in the "Top Events" section (lines 146-165) with the `EventCard` component, which already has expand + MarketRow + BetCalculator built in.
- This gives every top event full interactivity including the new Explore button.

### Files Changed
- `src/components/browser/EventCard.tsx` -- add Explore button with `useNavigate`
- `src/components/browser/AnalyticsView.tsx` -- replace static event list with `EventCard` components

