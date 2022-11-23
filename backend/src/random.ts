export default () => {
    const queue: number[] = [];

    let fetching: Promise<void> | null = null;
    const populateQueue = async () => {
        if (!fetching) {
            fetching =
                // returns 1024 numbers from 0 to 65535 generatrd by a quantum computer
                // reference: https://qrng.anu.edu.au/contact/api-documentation/
                fetch(`https://qrng.anu.edu.au/API/jsonI.php?length=1024&type=uint16`)
                    .then((r) => r.json())
                    .catch((e) => {
                        console.error(e);
                        return { data: [] };
                    })
                    .then(({ data }: { data?: number[] }) => data?.map((d: number) => d / 65535))
                    .then((numbers) => numbers?.forEach((n) => queue.push(n)));
        }
        await fetching;
        fetching = null;
    };

    populateQueue();

    return {
        next: () => {
            if (queue.length < 100) populateQueue();
            return queue.shift() ?? Math.random();
        }
    };
};
