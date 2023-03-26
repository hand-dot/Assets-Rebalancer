import * as React from "react";
import { useState, useEffect } from "react";

interface Asset {
  stock: number;
  commodity: number;
  bond: number;
}

interface Breakdown {
  category: "stock" | "commodity" | "bond";
  ticker: string;
  amount: number;
}

function rebalance(currentAsset: Asset): { ideal: Asset; operation: Asset } {
  const total = currentAsset.stock + currentAsset.commodity + currentAsset.bond;
  const ideal: Asset = {
    stock: total * 0.5,
    commodity: total * 0.3,
    bond: total * 0.2,
  };

  const operation: Asset = {
    stock: ideal.stock - currentAsset.stock,
    commodity: ideal.commodity - currentAsset.commodity,
    bond: ideal.bond - currentAsset.bond,
  };

  return { ideal, operation };
}

const RebalanceComponent: React.FC = () => {
  const [result, setResult] = useState<{ ideal: Asset; operation: Asset }>();
  const [breakdown, setBreakdown] = useState<Breakdown[]>([]);
  // Load stored data from local storage
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("assetData") || "[]");
    if (storedData.length > 0) {
      setBreakdown(storedData);
    }
  }, []);

  // Update result and store data in local storage
  useEffect(() => {
    const currentAsset: Asset = { stock: 0, commodity: 0, bond: 0 };

    breakdown.forEach((item) => {
      if (item.category === "stock") {
        currentAsset.stock += item.amount;
      } else if (item.category === "commodity") {
        currentAsset.commodity += item.amount;
      } else if (item.category === "bond") {
        currentAsset.bond += item.amount;
      }
    });

    setResult(rebalance(currentAsset));
    localStorage.setItem("assetData", JSON.stringify(breakdown));
    console.log("breakdown", breakdown);
  }, [breakdown]);

  // Format number with commas
  const formatNumber = (num: number) =>
    num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Add a new item to the breakdown
  const handleAddBreakdown = () => {
    setBreakdown([...breakdown, { category: "stock", ticker: "", amount: 0 }]);
  };

  // Update a specific breakdown item
  const handleUpdateBreakdown = (index: number, updatedItem: Breakdown) => {
    setBreakdown(
      breakdown.map((item, i) => (i === index ? updatedItem : item))
    );
  };

  // Remove a specific breakdown item
  const handleRemoveBreakdown = (index: number) => {
    setBreakdown(breakdown.filter((_, i) => i !== index));
  };

  const currentAsset: Asset = { stock: 0, commodity: 0, bond: 0 };

  breakdown.forEach((item) => {
    if (item.category === "stock") {
      currentAsset.stock += item.amount;
    } else if (item.category === "commodity") {
      currentAsset.commodity += item.amount;
    } else if (item.category === "bond") {
      currentAsset.bond += item.amount;
    }
  });

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h1>資産リバランス</h1>
      {result && (
        <div>
          <h2>理想</h2>
          <p>
            株式・社債・不動産: {formatNumber(result.ideal.stock / 10000)} 万
          </p>
          <p>コモディティ: {formatNumber(result.ideal.commodity / 10000)} 万</p>
          <p>国債・現金: {formatNumber(result.ideal.bond / 10000)} 万</p>

          <h2>操作</h2>
          <p>
            株式・社債・不動産: {formatNumber(result.operation.stock / 10000)}{" "}
            万
          </p>
          <p>
            コモディティ: {formatNumber(result.operation.commodity / 10000)} 万
          </p>
          <p>国債・現金: {formatNumber(result.operation.bond / 10000)} 万</p>
        </div>
      )}
      <h2>内訳</h2>
      <p>
        合計:{" "}
        {formatNumber(
          Object.values(currentAsset).reduce((a, b) => a + b, 0) / 10000
        )}{" "}
        万 ({JSON.stringify(currentAsset)})
      </p>
      <button onClick={handleAddBreakdown}>内訳追加</button>
      <table>
        <thead>
          <tr>
            <th>カテゴリ</th>
            <th>ティッカー/通貨名</th>
            <th>金額 (評価額)</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((item, index) => (
            <tr key={index}>
              <td>
                <select
                  value={item.category}
                  onChange={(e) =>
                    handleUpdateBreakdown(index, {
                      ...item,
                      category: e.target.value as
                        | "stock"
                        | "commodity"
                        | "bond",
                    })
                  }
                >
                  <option value="stock">株式・社債・不動産</option>
                  <option value="commodity">コモディティ</option>
                  <option value="bond">国債・現金</option>
                </select>
              </td>
              <td>
                <input
                  value={item.ticker}
                  onChange={(e) =>
                    handleUpdateBreakdown(index, {
                      ...item,
                      ticker: e.target.value,
                    })
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) =>
                    handleUpdateBreakdown(index, {
                      ...item,
                      amount: parseFloat(e.target.value),
                    })
                  }
                />
              </td>
              <td>
                <button onClick={() => handleRemoveBreakdown(index)}>
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RebalanceComponent;
