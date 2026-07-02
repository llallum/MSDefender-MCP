const PingIndicator = ({ active }: { active: boolean }) => {
    return (
        <>
            <style>{`
                @keyframes ping {
                    0%   { transform: scale(1); opacity: 1; }
                    70%  { transform: scale(2); opacity: 0; }
                    100% { transform: scale(2); opacity: 0; }
                }
                .ping-ring {
                    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
            `}</style>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ position: "relative", width: "16px", height: "16px" }}>
                    {active && (
                        <span
                            className="ping-ring"
                            style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: "50%",
                                backgroundColor: "green",
                                opacity: 0.75,
                            }}
                        />
                    )}
                    <span
                        style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            backgroundColor: active ? "green" : "red",
                            transition: "background-color 0.5s ease",
                        }}
                    />
                </div>
                <span>{active ? "Pong received" : "Waiting for pong..."}</span>
            </div>
        </>
    );
};

export default PingIndicator;
