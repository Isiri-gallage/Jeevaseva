import styles from './Tabs.module.css';

/**
 * Tabs — segmented view switcher.
 *
 * @param {{id, label, icon?, count?}[]} tabs
 * @param {string} value      Currently selected tab id
 * @param {(id) => void} onChange
 *
 * Uses the ARIA tab pattern (role="tablist"/"tab", aria-selected) so screen
 * readers announce "tab 2 of 3, selected" rather than reading three anonymous
 * buttons. The previous implementation used plain <div>s, which were not even
 * reachable by keyboard.
 */
const Tabs = ({ tabs, value, onChange, className = '' }) => (
  <div className={[styles.tablist, className].filter(Boolean).join(' ')} role="tablist">
    {tabs.map((tab) => {
      const selected = tab.id === value;
      return (
        <button
          key={tab.id}
          role="tab"
          type="button"
          aria-selected={selected}
          className={[styles.tab, selected && styles.tabActive].filter(Boolean).join(' ')}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon}
          {tab.label}
          {typeof tab.count === 'number' && (
            <span className={styles.count}>{tab.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

export default Tabs;
