import { useEffect, useState } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

const ledgerIdlFactory = ({ IDL }) => {
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8))
  });
  
  return IDL.Service({
    icrc1_balance_of: IDL.Func([Account], [IDL.Nat], ['query'])
  });
};

export function useBalance(principalId: string) {
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!principalId) return;

      try {
        const agent = new HttpAgent({
          host: 'http://localhost:4943',
        });
        await agent.fetchRootKey();
        
        const actor = Actor.createActor(ledgerIdlFactory, {
          agent,
          canisterId: 'bd3sg-teaaa-aaaaa-qaaba-cai'
        });

        const principal = Principal.fromText(principalId);
        const result = await actor.icrc1_balance_of({
          owner: principal,
          subaccount: []
        });

        const icp = Number(result) / 100000000;
        setBalance(icp.toFixed(2));
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [principalId]);

  return balance;
}