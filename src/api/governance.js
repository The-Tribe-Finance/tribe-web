// Governance proposal/analyst reads (spl-governance + Tribe's voter-weight program)
// belong to tribe-api. The browser only consumes the public read model.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787').replace(/\/$/, '');

export const emptyProposals = () => ({ proposals: [], source: 'unavailable' });

export const emptyAnalysts = () => ({ analysts: [], source: 'unavailable' });

export async function fetchProposals() {
  try {
    const response = await fetch(`${API_BASE}/v1/governance/proposals`);
    if (!response.ok) throw new Error(`proposals API returned ${response.status}`);
    const proposals = await response.json();
    if (!Array.isArray(proposals.proposals)) throw new Error('invalid proposals response');
    return proposals;
  } catch (error) {
    console.warn('Proposals API unavailable; rendering no proposals.', error);
    return emptyProposals();
  }
}

export async function fetchAnalystDirectory() {
  try {
    const response = await fetch(`${API_BASE}/v1/governance/analysts`);
    if (!response.ok) throw new Error(`analysts API returned ${response.status}`);
    const analysts = await response.json();
    if (!Array.isArray(analysts.analysts)) throw new Error('invalid analysts response');
    return analysts;
  } catch (error) {
    console.warn('Analysts API unavailable; rendering no analysts.', error);
    return emptyAnalysts();
  }
}
