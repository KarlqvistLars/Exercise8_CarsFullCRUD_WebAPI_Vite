import '@picocss/pico/css/pico.min.css';
import './assets/style.css'
import FotoXC60 from './assets/pics/FotoXC60.jpg';

interface Car {
  id?: number;
  brand: string;
  model: string;
  year: number;
  color: string;
}

const API_URL = "https://localhost:7248/api/cars";
let currentCarId: number | null = null;

const loadBtn = document.querySelector<HTMLButtonElement>('#load-btn')!;
const newBtn = document.querySelector<HTMLButtonElement>('#new-btn')!;
const carList = document.querySelector<HTMLDivElement>('#car-list')!;
const carForm = document.querySelector<HTMLFormElement>('#car-form')!;
const carIdInput = document.querySelector<HTMLInputElement>('#car-id')!;

const newCarDialog = document.querySelector<HTMLDialogElement>('#newCarDialog')!;
const editCarDialog = document.querySelector<HTMLDialogElement>('#editCarDialog')!;

const cancelBtn = document.querySelector<HTMLButtonElement>('#cancel-btn')!;
const cancelEditBtn = document.querySelector<HTMLButtonElement>('#cancel-edit-btn')!;
const saveEditBtn = document.querySelector<HTMLButtonElement>('#save-edit-btn')!;

const imageContainer = document.querySelector<HTMLDivElement>('#image-container')!;

if (imageContainer) {
  imageContainer.innerHTML = `<img src="${FotoXC60}" alt="Volvo XC60" style="width: 100%; max-width: 1200px; margin-bottom: 1rem;">`;
}

// ==========================================
// 🟢 READ (GET) - Hämta och visa alla bilar
// ==========================================
const fetchCars = async (): Promise<void> => {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Fel vid hämtning: ${response.status}`);
    }

    const cars: Car[] = await response.json();

    carList.innerHTML = "";

    if (cars.length === 0) {
      carList.innerHTML = "<p>Det finns inga bilar i databasen.</p>";
      return;
    }

    cars.forEach(car => {
      const card = document.createElement('div');
      card.className = 'car-card';
      card.innerHTML = `
                <div>
                    <strong>${car.brand} ${car.model}</strong> (${car.year}) <br>
                    <span style="font-size: 0.9rem; color: #777;">Färg: ${car.color}</span>
                </div>
                <div class="btn-group">
                    <button class="outline edit-btn">Redigera</button>
                    <button class="outline contrast delete-btn">Ta bort</button>
                </div>
            `;

      const editBtn = card.querySelector<HTMLButtonElement>('.edit-btn')!;
      const deleteBtn = card.querySelector<HTMLButtonElement>('.delete-btn')!;

      editBtn.addEventListener('click', () => prepareEdit(car));
      deleteBtn.addEventListener('click', () => {
        if (car.id !== undefined) {
          deleteCar(car.id);
        }
      });

      carList.appendChild(card);
    });

  } catch (error) {
    console.error("Fel:", error);
    carList.innerHTML = `<p style="color: red;">Kunde inte hämta bilar. Körs ditt API på ${API_URL}?</p>`;
  }
};

// ==========================================
// 🟢 CREATE (POST) - Skapa nya bilar
// ==========================================
const createCar = async (carData: Car): Promise<void> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(carData)
    });

    if (!response.ok) {
      throw new Error(`Fel vid skapande: ${response.status}`);
    }

    carForm.reset();
    newCarDialog.close();
    fetchCars();

  } catch (error) {
    console.error("Fel:", error);
    alert("Kunde inte skapa bilen. Kontrollera konsolen för mer information.");
  }
};

// ==========================================
// 🟢 UPDATE (PUT) - Uppdatera bilar
// ==========================================
const prepareEdit = (car: Car): void => {
  if (car.id === undefined) return;

  currentCarId = car.id;

  document.querySelector<HTMLInputElement>("#editBrand")!.value = car.brand;
  document.querySelector<HTMLInputElement>("#editModel")!.value = car.model;
  document.querySelector<HTMLInputElement>("#editYear")!.value = car.year.toString();
  document.querySelector<HTMLInputElement>("#editColor")!.value = car.color;

  editCarDialog.showModal();
};

const updateCar = async (): Promise<void> => {
  if (currentCarId === null) return;

  const updatedCar: Car = {
    brand: document.querySelector<HTMLInputElement>("#editBrand")!.value,
    model: document.querySelector<HTMLInputElement>("#editModel")!.value,
    year: Number(document.querySelector<HTMLInputElement>("#editYear")!.value),
    color: document.querySelector<HTMLInputElement>("#editColor")!.value
  };

  try {
    const response = await fetch(`${API_URL}/${currentCarId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedCar)
    });

    if (!response.ok) {
      console.error("Fel:", await response.text());
      return;
    }

    editCarDialog.close();
    currentCarId = null;
    await fetchCars(); // fetchCars() istället för loadCars() som saknades

  } catch (error) {
    console.error("Fel vid uppdatering:", error);
  }
};

// ==========================================
// 🟢 DELETE (DELETE) - Ta bort bilar
// ==========================================
const deleteCar = async (carId: number): Promise<void> => {
  if (!confirm("Är du säker på att du vill ta bort denna bil?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${carId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Fel vid borttagning: ${response.status}`);
    }

    fetchCars();

  } catch (error) {
    console.error("Fel:", error);
    alert("Kunde inte ta bort bilen. Kontrollera konsolen för mer information.");
  }
};

// EVENT LISTENERS
loadBtn.addEventListener('click', fetchCars);

newBtn.addEventListener('click', () => {
  newCarDialog.showModal();
});

cancelBtn.addEventListener('click', () => {
  newCarDialog.close();
});

carForm.addEventListener('submit', (event: Event) => {
  event.preventDefault();

  const carData: Car = {
    brand: document.querySelector<HTMLInputElement>('#brand')!.value,
    model: document.querySelector<HTMLInputElement>('#model')!.value,
    year: parseInt(document.querySelector<HTMLInputElement>('#year')!.value),
    color: document.querySelector<HTMLInputElement>('#color')!.value
  };

  if (carIdInput.value) {
    updateCar();
  } else {
    createCar(carData);
  }
});

saveEditBtn.addEventListener('click', updateCar);
cancelEditBtn.addEventListener('click', () => {
  editCarDialog.close();
  currentCarId = null;
});