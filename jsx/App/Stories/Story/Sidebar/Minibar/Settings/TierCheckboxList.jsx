class TierCheckbox extends React.Component {
   // I/P: tier_id, a string like "T1" or "T15"
   //    tier_name, a string like "English Morphemes"
   // O/P: a checkbox with the ability to hide/show elements with tier-data={tier_id}
   // Status: tested, working
   constructor(props) {
      super(props);
      this.state = {
         checkboxState: true
      };
      this.toggle = this.toggle.bind(this);
   }

   toggle(event) {
      this.setState({checkboxState: !this.state.checkboxState});

      if (this.state.checkboxState) {
         $("tr[data-tier='" + this.props.tier_id + "']").css('display', 'none');
      } else {
         $("tr[data-tier='" + this.props.tier_id + "']").css('display', 'table-row');
      }
   }

   render() {
      const tier_id = this.props.tier_id;
      const tier_name = this.props.tier_name;
      return (
         <li>
            <input type="checkbox" onClick={this.toggle} defaultChecked />
            <label>{tier_name}</label>
         </li>
      );
   }
}

export function TierCheckboxList({ tiers }) {
   // I/P: tiers, a hashmap from Tier IDs to their names
   // O/P: an unordered list of TierCheckboxes
   // Status: tested, working
   let output = [];
   for (const tier_id in tiers) {
      if (tiers.hasOwnProperty(tier_id)) {
         output.push(<TierCheckbox key={tier_id} tier_id={tier_id} tier_name={tiers[tier_id]['name']} />);
      }
   }
   return <div id="tierList">Show/hide tiers: <ul>{output}</ul></div>;
}