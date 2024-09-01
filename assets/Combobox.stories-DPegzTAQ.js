import{j as r}from"./jsx-runtime-BjG_zV1W.js";import{f,u as g,w,a as l,e as o}from"./index-CHk9ml5q.js";import{g as B,D as v,C as h,K as k}from"./HubertProvider-BnbjTwn9.js";import"./index-CbIUIaG1.js";import"./index-DsJRWNrc.js";import"./isObjectLike-DExiV3nx.js";import"./index-DZLKizrv.js";import"./index-D3ylJrlI.js";import"./_commonjsHelpers-BosuxZz1.js";import"./debounce-DSapFuzV.js";import"./isSymbol-Ba4JPt5E.js";const V={title:"form/ComboBox",component:B,subcomponents:{},args:{title:"Chose an icon ... wisely",onSelect:f()},docs:{description:{component:`
            The ComboBox allows the user to get suggestions for a given input.
            The user can then either select one of the suggestions or, if adjusted, enter a new one.
            `}}},i={args:{items:[{key:"home",leftSection:r.jsx(v,{}),label:"Home",textValue:"Home"},{key:"alarm",leftSection:r.jsx(h,{}),label:"Alarm with right X",textValue:"Alarm",selected:!0},{key:"account",leftSection:r.jsx(k,{}),label:"Balance",textValue:"Balance"}]},play:async({canvasElement:n})=>{const t=g.setup({delay:100}),e=w(n);await t.click(e.getByRole("button")),await l(()=>{o(e.getByRole("listbox")).toBeVisible()}),await new Promise(a=>setTimeout(a,500)),await t.click(e.getByRole("option",{name:"Balance"}))}},s={args:{title:"Search for a Star Wars character or species",items:async n=>x(n).then(t=>t.sort().map(e=>({key:e,label:e,leftSection:r.jsx(h,{})})))},name:"fetching items while typing",play:async({canvasElement:n,args:t})=>{const e=g.setup({delay:50}),a=w(n);await e.click(a.getByRole("combobox")),await e.keyboard("yoda"),await l(()=>{o(a.getByRole("listbox")).toBeVisible()}),await new Promise(b=>setTimeout(b,400)),await l(()=>{o(a.getAllByRole("option")).toHaveLength(1)}),await e.click(a.getByRole("option",{name:"Yoda"})),await l(()=>{o(a.queryByRole("listbox")).toBeNull()}),o(t.onSelect).toHaveBeenCalledWith("Yoda")},parameters:{chromatic:{delay:500}}},x=n=>{const t=["Luke Skywalker","C-3PO","R2-D2","Darth Vader","Leia Organa","Owen Lars","Beru Whitesun lars","R5-D4","Biggs Darklighter","Obi-Wan Kenobi","Anakin Skywalker","Wilhuff Tarkin","Chewbacca","Han Solo","Greedo","Jabba Desilijic Tiure","Wedge Antilles","Jek Tono Porkins","Yoda","Palpatine","Boba Fett","IG-88","Bossk","Lando Calrissian","Lobot","Ackbar","Mon Mothma","Arvel Crynyd","Wicket Systri Warrick","Nien Nunb","Qui-Gon Jinn","Nute Gunray","Finis Valorum","Padmé Amidala","Jar Jar Binks","Roos Tarpals","Rugor Nass","Ric Olié","Watto","Sebulba","Quarsh Panaka","Shmi Skywalker","Darth Maul","Bib Fortuna","Ayla Secura","Ratts Tyerel","Dud Bolt","Gasgano","Ben Quadinaros","Mace Windu","Ki-Adi-Mundi","Kit Fisto","Eeth Koth","Adi Gallia","Saesee Tiin","Yarael Poof","Plo Koon","Mas Amedda","Gregar Typho","Cordé","Cliegg Lars","Poggle the Lesser","Luminara Unduli","Barriss Offee","Dormé","Dooku","Bail Prestor Organa","Jango Fett","Zam Wesell","Dexter Jettster","Lama Su","Taun We","Jocasta Nu","R4-P17","Wat Tambor","San Hill","Shaak Ti","Grievous","Tarfful","Raymus Antilles","Sly Moore","Tion Medon"];return new Promise(e=>{setTimeout(()=>{e(t.filter(a=>a.toLowerCase().includes(n.toLowerCase())))},250)})};var c,m,u;i.parameters={...i.parameters,docs:{...(c=i.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    items: [{
      key: 'home',
      leftSection: <DragHandle />,
      label: 'Home',
      textValue: 'Home'
    }, {
      key: 'alarm',
      leftSection: <Close />,
      label: 'Alarm with right X',
      textValue: 'Alarm',
      selected: true
    }, {
      key: 'account',
      leftSection: <KeyboardArrowLeft />,
      label: 'Balance',
      textValue: 'Balance'
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const fireEvent = userEvent.setup({
      delay: 100
    });
    const canvas = within(canvasElement);
    await fireEvent.click(canvas.getByRole('button'));
    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeVisible();
    });
    await new Promise(resolve => setTimeout(resolve, 500)); // wait for animation to finish

    await fireEvent.click(canvas.getByRole('option', {
      name: 'Balance'
    }));
  }
}`,...(u=(m=i.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};var y,d,p;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    title: 'Search for a Star Wars character or species',
    items: async (value: string) => {
      return getResults(value).then(results => {
        return results.sort().map(result => ({
          key: result,
          label: result,
          leftSection: <Close />
        }));
      });
    }
  },
  name: 'fetching items while typing',
  play: async ({
    canvasElement,
    args
  }) => {
    const fireEvent = userEvent.setup({
      delay: 50
    });
    const canvas = within(canvasElement);
    await fireEvent.click(canvas.getByRole('combobox'));
    await fireEvent.keyboard('yoda');
    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeVisible();
    });
    await new Promise(resolve => setTimeout(resolve, 400)); // wait for animation to finish

    await waitFor(() => {
      expect(canvas.getAllByRole('option')).toHaveLength(1);
    });
    await fireEvent.click(canvas.getByRole('option', {
      name: 'Yoda'
    }));
    await waitFor(() => {
      expect(canvas.queryByRole('listbox')).toBeNull();
    });
    expect(args.onSelect).toHaveBeenCalledWith('Yoda');
  },
  parameters: {
    chromatic: {
      delay: 500
    }
  }
}`,...(p=(d=s.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};const F=["WithPredefinedItems","WithRequestedItems"];export{i as WithPredefinedItems,s as WithRequestedItems,F as __namedExportsOrder,V as default};
