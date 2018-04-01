class TierCheckbox extends React.Component {
   // I/P: tier_id, a string like "T1" or "T15"
   //    tier_name, a string like "English Morphemes"
   // O/P: a checkbox with the ability to hide/show elements with tier-data={tier_id}
   // Status: tested, working
   constructor(props) {
      super(props);
      const tier_name = this.props.tier_name;
      const unchecked_tiers = ["Morfema (forma típico) a'ingae (borman)", "Morfema (texto) a'ingae (borman)"]
      
      if (unchecked_tiers.indexOf(tier_name) < 0) {
         this.state = {
            checkboxState: true
         };
      } else {
         this.state = {
            checkboxState: false
         };
      }
      this.toggle = this.toggle.bind(this);
   }

   componentDidMount() {
      if (this.state.checkboxState) {
         $("tr[data-tier='" + this.props.tier_id + "']").css('display', 'table-row');
      } else {
         $("tr[data-tier='" + this.props.tier_id + "']").css('display', 'none');
      }
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
      const unchecked_tiers = ["Morfema (forma típico) a'ingae (borman)", "Morfema (texto) a'ingae (borman)"]

      if (unchecked_tiers.indexOf(tier_name) < 0) {
         return (
            <li>
               <input type="checkbox" onClick={this.toggle} defaultChecked />
               <label>{tier_name}</label>
            </li>
         );
      } else {
         return (
            <li>
               <input type="checkbox" onClick={this.toggle} />
               <label>{tier_name}</label>
            </li>
         );
      }
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
   return <div id="tierList"><b>Show/hide tiers:</b> <ul>{output}</ul></div>;
}